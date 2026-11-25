import { auth } from "@/auth";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getOptimizedVideoUrl, getVideoPosterUrl } from "@/lib/video-optimization";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.realRole || (session.user as any)?.role;
    if (userRole !== "super_admin" && userRole !== "SUPER_ADMIN" && userRole !== "admin_kominfo") {
      return NextResponse.json({ error: "Forbidden: Hanya Superadmin dan Kominfo yang dapat mengunggah video reels" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "File video tidak ditemukan" }, { status: 400 });
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "File harus berupa video (MP4, WebM, MOV, dsb)" }, { status: 400 });
    }

    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "Ukuran video melebihi batas maksimal 100MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload ke Cloudinary dengan optimasi video (kompresi otomatis + streaming)
    const uploadOptions: Record<string, any> = {
      folder: "ldk-alhidayah/reels",
      resource_type: "video",
      // Eager transformation untuk memastikan video 720p HD yang ringan & stabil
      eager: [
        {
          format: "mp4",
          width: 720,
          crop: "limit",
          quality: "auto:good",
          video_codec: "auto",
        },
      ],
      eager_async: false,
    };

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const secureUrl = uploadResult.secure_url;
    const optimizedUrl = getOptimizedVideoUrl(secureUrl);
    const posterUrl = getVideoPosterUrl(secureUrl);
    const duration = uploadResult.duration ? Math.round(uploadResult.duration) : null;

    return NextResponse.json(
      {
        url: secureUrl,
        optimizedUrl,
        thumbnailUrl: posterUrl,
        duration,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Reels upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengunggah dan mengompresi video" },
      { status: 500 }
    );
  }
}

