import { auth } from "@/auth";
import { db } from "@/db";
import { galleries, events, galleryImages } from "@/db/schema";
import { eq, and, ilike, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import cloudinary from "@/lib/cloudinary";
import { logActivity } from "@/lib/logger";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const periodId = url.searchParams.get("periodId");
    let divisionId = url.searchParams.get("divisionId");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    const userRole = session.user.role;
    const userDivisionId = session.user.divisionId;

    if (userRole === "ADMIN_BIDANG") {
      divisionId = String(userDivisionId);
    }

    const conditions = [];

    if (periodId) conditions.push(eq(galleries.periodId, parseInt(periodId)));
    if (divisionId) conditions.push(eq(galleries.divisionId, parseInt(divisionId)));
    if (status) conditions.push(eq(galleries.status, status as any));
    if (search) conditions.push(ilike(galleries.title, `%${search}%`));

    const queryWhere = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db.query.galleries.findMany({
      where: queryWhere,
      limit,
      offset,
      with: { 
        period: true, 
        division: true, 
        event: true,
        images: true
      },
      orderBy: [desc(galleries.id)],
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    if (session.user.role === "KETUA") {
      return NextResponse.json({ error: "Forbidden: KETUA hanya dapat melihat data" }, { status: 403 });
    }

    const formData = await req.formData();
    
    const title = formData.get("title") as string;
    const eventIdRaw = formData.get("eventId") as string;
    let divisionId = parseInt(formData.get("divisionId") as string);
    let periodId = parseInt(formData.get("periodId") as string);
    const description = formData.get("description") as string;
    
    if (!title || isNaN(divisionId) || isNaN(periodId)) {
       return NextResponse.json({ error: "Judul, Bidang, dan Periode wajib diisi" }, { status: 400 });
    }

    const eventId = eventIdRaw && eventIdRaw !== "null" && eventIdRaw !== "undefined" ? parseInt(eventIdRaw) : null;

    // Consistency Check
    if (eventId) {
      const event = await db.query.events.findFirst({
        where: eq(events.id, eventId)
      });
      if (!event) {
        return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
      }
      divisionId = event.divisionId!;
      periodId = event.periodId;
    }

    if (session.user.role === "ADMIN_BIDANG") {
      if (divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Galeri harus milik bidang Anda" }, { status: 403 });
      }
    }

    const files = formData.getAll("images") as File[];
    if (files.length > 3) {
      return NextResponse.json({ error: "Maksimal 3 foto yang diizinkan." }, { status: 400 });
    }

    // 1. Create Gallery Record
    const [newGallery] = await db.insert(galleries).values({
      title,
      description,
      eventId,
      divisionId,
      periodId,
      status: "PUBLISHED"
    }).returning();

    // 2. Upload Images to Cloudinary
    let coverImageUrl = null;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size === 0) continue;
      
      if (!file.type.startsWith("image/")) {
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
         continue; // skip large files or we could throw
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      
      try {
        const uploadResult: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "ldk-alhidayah/galleries",
              fetch_format: "auto",
              quality: "auto",
              width: 1920,
              crop: "limit"
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        if (i === 0) coverImageUrl = uploadResult.secure_url;

        await db.insert(galleryImages).values({
          galleryId: newGallery.id,
          imageUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          width: uploadResult.width,
          height: uploadResult.height,
        });
      } catch (err) {
        console.error("Failed to upload file to Cloudinary", err);
      }
    }
    
    if (coverImageUrl) {
        await db.update(galleries).set({ coverImage: coverImageUrl }).where(eq(galleries.id, newGallery.id));
    }

    
    try {
      await logActivity({
        action: "CREATE",
        entityType: "GALLERIES",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(newGallery, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Optional: Add strict role check here if needed, but we trust the route's existing auth
    await db.delete(galleries);
    
    try {
      await logActivity({
        action: "DELETE",
        entityType: "GALLERIES",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
