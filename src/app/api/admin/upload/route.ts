import { auth } from "@/auth";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string || "ldk-alhidayah/general";
    const resourceType = formData.get("resource_type") as string || "auto";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const isVideo = file.type.startsWith("video/") || resourceType === "video";
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "File harus berupa gambar atau video" }, { status: 400 });
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Ukuran file terlalu besar (maks ${isVideo ? "100MB" : "5MB"})` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadOptions: Record<string, any> = {
      folder,
      resource_type: isVideo ? "video" : "image",
    };

    if (isImage) {
      uploadOptions.fetch_format = "auto";
      uploadOptions.quality = "auto";
    }

    if (isVideo) {
      uploadOptions.eager = [{ format: "mp4", transformation: [{ quality: "auto" }] }];
      uploadOptions.eager_async = true;
    }

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (err, result) => { if (err) reject(err); else resolve(result); }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      resourceType: uploadResult.resource_type,
      bytes: uploadResult.bytes,
    }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
