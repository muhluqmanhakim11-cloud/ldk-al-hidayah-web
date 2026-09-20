import { auth } from "@/auth";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = session.user.role;
    if (userRole === "KETUA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = parseInt((await params).id);
    const formData = await req.formData();
    const file = formData.get("photo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File foto tidak ditemukan" }, { status: 400 });
    }

    // Validate file type & size
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return NextResponse.json({ error: "Format file harus JPG, PNG, atau WebP" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "ldk-pengurus",
          transformation: [{ width: 400, height: 500, crop: "fill", gravity: "face" }],
        },
        (error, result) => {
          if (error || !result) reject(error);
          else resolve(result as { secure_url: string });
        }
      );
      stream.end(buffer);
    });

    // Update DB
    const [updated] = await db
      .update(members)
      .set({ photoUrl: uploadResult.secure_url })
      .where(eq(members.id, id))
      .returning();

    return NextResponse.json({ photoUrl: updated.photoUrl });
  } catch (error) {
    console.error("Upload photo error:", error);
    return NextResponse.json({ error: "Gagal mengupload foto" }, { status: 500 });
  }
}
