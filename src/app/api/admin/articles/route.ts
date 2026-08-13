import { auth } from "@/auth";
import { db } from "@/db";
import { articles, users, divisions } from "@/db/schema";
import { eq, ilike, desc, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const search = url.searchParams.get("search");
    const divisionId = url.searchParams.get("divisionId");

    const userRole = session.user.role;
    const userDivisionId = session.user.divisionId;

    const conditions = [];
    if (search) conditions.push(ilike(articles.title, `%${search}%`));
    
    let targetDivisionId = divisionId;
    if (userRole === "ADMIN_BIDANG") {
      targetDivisionId = String(userDivisionId);
    }
    
    if (targetDivisionId) {
       conditions.push(eq(articles.divisionId, parseInt(targetDivisionId)));
    }

    const queryWhere = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db.query.articles.findMany({
      where: queryWhere,
      with: { 
        author: { columns: { id: true, name: true } }, 
        division: { columns: { id: true, name: true } }
      },
      orderBy: [desc(articles.createdAt)],
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role === "KETUA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    let divisionIdRaw = formData.get("divisionId") as string;
    let divisionId = divisionIdRaw && divisionIdRaw !== "null" && divisionIdRaw !== "undefined" ? parseInt(divisionIdRaw) : null;
    const file = formData.get("coverImage") as File | null;

    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan Konten wajib diisi" }, { status: 400 });
    }

    if (session.user.role === "ADMIN_BIDANG") {
      divisionId = session.user.divisionId;
    }

    // Generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Date.now();

    let coverImageUrl = null;
    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "File cover harus berupa gambar" }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Ukuran gambar terlalu besar (maks 5MB)" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "ldk-alhidayah/articles", fetch_format: "auto", quality: "auto" },
          (err, result) => { if (err) reject(err); else resolve(result); }
        );
        uploadStream.end(buffer);
      });
      coverImageUrl = uploadResult.secure_url;
    }

    const [newArticle] = await db.insert(articles).values({
      title,
      slug,
      content,
      coverImage: coverImageUrl,
      authorId: parseInt(session.user.id),
      divisionId,
      status: "PUBLISHED",
      publishedAt: new Date()
    }).returning();

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
