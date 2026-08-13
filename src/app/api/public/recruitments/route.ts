import { NextResponse } from "next/server";
import { db } from "@/db";
import { periods, recruitments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? Redis.fromEnv()
  : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
    })
  : null;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(req: Request) {
  if (ratelimit) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Terlalu banyak permintaan. Silakan coba beberapa menit lagi.", errors: [] },
        { status: 429 }
      );
    }
  }

  let uploadedPublicId: string | null = null;
  
  try {
    const activePeriod = await db.query.periods.findFirst({
      where: eq(periods.isActive, true),
      orderBy: (p, { desc }) => [desc(p.id)],
    });

    if (!activePeriod || !activePeriod.isRecruitmentOpen) {
      return NextResponse.json(
        { success: false, message: "Pendaftaran saat ini ditutup.", errors: [] },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const name = formData.get("name")?.toString();
    const nim = formData.get("nim")?.toString();
    const studyProgram = formData.get("studyProgram")?.toString();
    const semester = formData.get("semester")?.toString();
    const email = formData.get("email")?.toString();
    const whatsapp = formData.get("whatsapp")?.toString();
    const interestedDivisionId = formData.get("interestedDivisionId")?.toString();
    const reason = formData.get("reason")?.toString();
    const photo = formData.get("photo") as File | null;

    // Basic required fields validation
    if (!name || !nim || !studyProgram || !semester || !email || !whatsapp || !interestedDivisionId || !reason || !photo) {
      return NextResponse.json(
        { success: false, message: "Semua field form wajib diisi.", errors: [] },
        { status: 400 }
      );
    }

    // Pre-insert duplicate check (friendly message)
    const existingRegistration = await db.query.recruitments.findFirst({
      where: and(
        eq(recruitments.periodId, activePeriod.id),
        eq(recruitments.nim, nim)
      )
    });

    if (existingRegistration) {
      return NextResponse.json(
        { success: false, message: `Halo, mahasiswa dengan NIM ${nim} sudah terdaftar pada periode ini.`, errors: [] },
        { status: 409 } // Conflict
      );
    }

    // Image Validation
    if (!ACCEPTED_IMAGE_TYPES.includes(photo.type)) {
      return NextResponse.json(
        { success: false, message: "Format foto tidak didukung (Hanya JPG, PNG, WEBP).", errors: [] },
        { status: 400 }
      );
    }

    if (photo.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ukuran foto maksimal adalah 2MB.", errors: [] },
        { status: 400 }
      );
    }

    // Zod Validation
    const schema = z.object({
      name: z.string().min(2),
      nim: z.string().regex(/^[0-9]+$/, "NIM harus berupa angka"),
      email: z.string().email(),
      whatsapp: z.string().regex(/^[0-9]+$/, "Nomor WhatsApp harus berupa angka").min(9).max(15),
      semester: z.number().int().min(1).max(14),
      interestedDivisionId: z.number().int().positive(),
    });

    const parsed = schema.safeParse({
      name,
      nim,
      email,
      whatsapp,
      semester: parseInt(semester, 10),
      interestedDivisionId: parseInt(interestedDivisionId, 10)
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validasi data gagal", errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }

    // Cloudinary Upload
    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        folder: "ldk-alhidayah/recruitments",
        fetch_format: "auto",
        quality: "auto",
        width: 1280,
        crop: "limit"
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });

    uploadedPublicId = uploadResult.public_id;

    // Database Insert
    const [newRecruitment] = await db.insert(recruitments).values({
      periodId: activePeriod.id,
      name: parsed.data.name,
      nim: parsed.data.nim,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      semester: parsed.data.semester,
      studyProgram,
      reason,
      interestedDivisionId: parsed.data.interestedDivisionId,
      photoUrl: uploadResult.secure_url,
      status: "PENDING",
    }).returning();

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil dikirim. Silakan tunggu informasi selanjutnya.",
      data: newRecruitment
    });

  } catch (error: any) {
    console.error("Error submitting recruitment:", error);
    
    // Orphan Cleanup
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId);
        console.log(`Cleaned up orphaned image: ${uploadedPublicId}`);
      } catch (cleanupError) {
        console.error("Failed to clean up image on Cloudinary:", cleanupError);
      }
    }

    // Catch unique constraint violation natively just in case race condition bypassed our pre-check
    if (error.code === '23505' && error.constraint === 'period_nim_idx') {
      return NextResponse.json(
        { success: false, message: "NIM ini sudah terdaftar sebelumnya.", errors: [] },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server", errors: [String(error)] },
      { status: 500 }
    );
  }
}
