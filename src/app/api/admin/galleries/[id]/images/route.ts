import { auth } from "@/auth";
import { db } from "@/db";
import { galleries, galleryImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    if (session.user.role === "KETUA") {
      return NextResponse.json({ error: "Forbidden: KETUA hanya dapat melihat data" }, { status: 403 });
    }

    const galleryId = parseInt((await params).id);
    const existingGallery = await db.query.galleries.findFirst({ where: eq(galleries.id, galleryId) });
    
    if (!existingGallery) {
      return NextResponse.json({ error: "Galeri tidak ditemukan" }, { status: 404 });
    }

    if (session.user.role === "ADMIN_BIDANG") {
      if (existingGallery.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Anda tidak dapat mengunggah foto ke galeri bidang lain" }, { status: 403 });
      }
    }

    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const uploadedImages = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: `File ${file.name} bukan gambar` }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File ${file.name} terlalu besar (maks 5MB)` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      let uploadResult;
      try {
        uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "ldk-alhidayah/galleries",
              fetch_format: "auto", // f_auto
              quality: "auto", // q_auto
              width: 1920, // resize if too large
              crop: "limit"
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });
      } catch (cloudinaryErr) {
        console.error("Cloudinary upload error:", cloudinaryErr);
        return NextResponse.json({ error: "Gagal mengunggah gambar ke Cloudinary" }, { status: 500 });
      }

      const res = uploadResult as any;

      try {
        const [insertedImage] = await db.insert(galleryImages).values({
          galleryId,
          imageUrl: res.secure_url,
          publicId: res.public_id,
          format: res.format,
          bytes: res.bytes,
          width: res.width,
          height: res.height,
        }).returning();

        uploadedImages.push(insertedImage);
      } catch (dbErr) {
        console.error("DB Insert error, deleting orphan file:", res.public_id);
        await cloudinary.uploader.destroy(res.public_id);
        return NextResponse.json({ error: "Gagal menyimpan metadata gambar ke database" }, { status: 500 });
      }
    }

    // Auto-publish the gallery if it has images uploaded
    if (uploadedImages.length > 0) {
      // Set the gallery status to PUBLISHED. Optionally set the coverImage if it's the first image.
      await db.update(galleries)
        .set({ 
          status: "PUBLISHED",
          ...(existingGallery.coverImage ? {} : { coverImage: uploadedImages[0].imageUrl }) 
        })
        .where(eq(galleries.id, galleryId));
    }

    return NextResponse.json(uploadedImages, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
