import { auth } from "@/auth";
import { db } from "@/db";
import { galleries, galleryImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, imageId: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    if (session.user.role === "KETUA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, imageId } = await params;
    const galleryId = parseInt(id);
    const imgId = parseInt(imageId);

    const existingGallery = await db.query.galleries.findFirst({ where: eq(galleries.id, galleryId) });
    if (!existingGallery) {
      return NextResponse.json({ error: "Galeri tidak ditemukan" }, { status: 404 });
    }

    if (session.user.role === "ADMIN_BIDANG") {
      if (existingGallery.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Anda tidak dapat menghapus foto galeri bidang lain" }, { status: 403 });
      }
    }

    const image = await db.query.galleryImages.findFirst({
      where: and(eq(galleryImages.id, imgId), eq(galleryImages.galleryId, galleryId))
    });

    if (!image) {
      return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
    }

    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (cloudinaryErr) {
      console.error("Gagal menghapus aset dari Cloudinary:", cloudinaryErr);
      return NextResponse.json({ error: "Gagal menghapus aset Cloudinary" }, { status: 500 });
    }

    await db.delete(galleryImages).where(eq(galleryImages.id, imgId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
