import { auth } from "@/auth";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function PATCH(req: Request, { params }: any) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role === "KETUA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const existingArticle = await db.query.articles.findFirst({ where: eq(articles.id, id) });
    if (!existingArticle) return NextResponse.json({ error: "Article not found" }, { status: 404 });

    if (session.user.role === "ADMIN_BIDANG" && existingArticle.divisionId !== session.user.divisionId) {
      return NextResponse.json({ error: "Forbidden: Artikel milik bidang lain" }, { status: 403 });
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

    let coverImageUrl = existingArticle.coverImage;
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

    const [updatedArticle] = await db.update(articles).set({
      title,
      content,
      divisionId,
      coverImage: coverImageUrl,
    }).where(eq(articles.id, id)).returning();

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role === "KETUA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const existingArticle = await db.query.articles.findFirst({ where: eq(articles.id, id) });
    if (!existingArticle) return NextResponse.json({ error: "Article not found" }, { status: 404 });

    if (session.user.role === "ADMIN_BIDANG" && existingArticle.divisionId !== session.user.divisionId) {
      return NextResponse.json({ error: "Forbidden: Artikel milik bidang lain" }, { status: 403 });
    }

    const [deleted] = await db.delete(articles).where(eq(articles.id, id)).returning();
    return NextResponse.json(deleted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
