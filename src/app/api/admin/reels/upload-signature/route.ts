import { auth } from "@/auth";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

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

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "ldk-alhidayah/reels";

    // Parameter yang akan di-sign (harus persis sama dengan yang dikirim client)
    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (error: any) {
    console.error("Signature error:", error);
    return NextResponse.json(
      { error: "Gagal membuat signature upload" },
      { status: 500 }
    );
  }
}

