import { auth } from "@/auth";
import { db } from "@/db";
import { galleries, events, galleryImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import cloudinary from "@/lib/cloudinary";

const gallerySchema = z.object({
  title: z.string().min(1, "Judul galeri wajib diisi"),
  eventId: z.coerce.number().optional().nullable(),
  divisionId: z.coerce.number().min(1, "Bidang wajib diisi"),
  periodId: z.coerce.number().min(1, "Periode wajib diisi"),
  description: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    if (session.user.role === "KETUA") {
      return NextResponse.json({ error: "Forbidden: KETUA hanya dapat melihat data" }, { status: 403 });
    }

    const id = parseInt((await params).id);
    const body = await req.json();
    const parsed = gallerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    const validated = parsed.data;

    const existingGallery = await db.query.galleries.findFirst({ where: eq(galleries.id, id) });
    if (!existingGallery) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    if (session.user.role === "ADMIN_BIDANG") {
      if (existingGallery.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Anda tidak dapat mengubah galeri milik bidang lain" }, { status: 403 });
      }
    }

    // Consistency Check
    if (validated.eventId) {
      const event = await db.query.events.findFirst({
        where: eq(events.id, validated.eventId)
      });
      if (!event) {
        return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
      }
      
      validated.divisionId = event.divisionId!;
      validated.periodId = event.periodId;
    }

    if (session.user.role === "ADMIN_BIDANG") {
      if (validated.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Galeri harus tetap berada di bidang Anda" }, { status: 403 });
      }
    }

    const [updated] = await db.update(galleries).set({ ...validated, updatedAt: new Date() }).where(eq(galleries.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    if (session.user.role === "KETUA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = parseInt((await params).id);
    const existingGallery = await db.query.galleries.findFirst({ 
      where: eq(galleries.id, id),
      with: { images: true }
    });
    
    if (!existingGallery) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    if (session.user.role === "ADMIN_BIDANG") {
      if (existingGallery.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Anda tidak dapat menghapus galeri milik bidang lain" }, { status: 403 });
      }
    }

    // Delete all images from Cloudinary
    if (existingGallery.images && existingGallery.images.length > 0) {
      const publicIds = existingGallery.images.map(img => img.publicId);
      for (const publicId of publicIds) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryErr) {
          console.error("Failed to delete from Cloudinary:", publicId, cloudinaryErr);
        }
      }
      // Delete metadata from DB
      await db.delete(galleryImages).where(eq(galleryImages.galleryId, id));
    }

    await db.delete(galleries).where(eq(galleries.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
