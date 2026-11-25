import { auth } from "@/auth";
import { db } from "@/db";
import { reels } from "@/db/schema";
import { eq, desc, asc, ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/logger";
import { revalidatePublic } from "@/lib/revalidate";
import { getOptimizedVideoUrl, getVideoPosterUrl } from "@/lib/video-optimization";

const reelCreateSchema = z.object({
  title: z.string().min(1, "Judul reels wajib diisi").max(255),
  description: z.string().optional().nullable(),
  speaker: z.string().optional().nullable(),
  isLdkDai: z.boolean().default(true),
  videoUrl: z.string().url("URL video harus valid").min(1, "Video wajib diisi"),
  thumbnailUrl: z.string().optional().nullable(),
  duration: z.coerce.number().optional().nullable(),
  orderIndex: z.coerce.number().default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as any)?.realRole || (session.user as any)?.role;
    if (userRole !== "super_admin" && userRole !== "SUPER_ADMIN" && userRole !== "admin_kominfo") {
      return NextResponse.json({ error: "Forbidden: Hanya Superadmin dan Kominfo yang dapat mengakses Reels Dakwah" }, { status: 403 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search");
    const status = url.searchParams.get("status");

    const conditions = [];

    if (status && status !== "ALL") {
      conditions.push(eq(reels.status, status as any));
    }

    if (search) {
      conditions.push(
        or(
          ilike(reels.title, `%${search}%`),
          ilike(reels.speaker, `%${search}%`),
          ilike(reels.description, `%${search}%`)
        )
      );
    }

    const items = await db
      .select()
      .from(reels)
      .where(conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : andConditions(conditions)) : undefined)
      .orderBy(asc(reels.orderIndex), desc(reels.createdAt));

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("GET /api/admin/reels error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function andConditions(arr: any[]) {
  const { and } = require("drizzle-orm");
  return and(...arr);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as any)?.realRole || (session.user as any)?.role;
    if (userRole !== "super_admin" && userRole !== "SUPER_ADMIN" && userRole !== "admin_kominfo") {
      return NextResponse.json({ error: "Forbidden: Hanya Superadmin dan Kominfo yang dapat mengelola Reels Dakwah" }, { status: 403 });
    }

    const body = await req.json();
    const validated = reelCreateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Data tidak valid" },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Otomatisasi URL Video (jika Cloudinary, sisipkan optimasi kompresi)
    const optimizedVideoUrl = getOptimizedVideoUrl(data.videoUrl);
    const posterUrl = data.thumbnailUrl || getVideoPosterUrl(optimizedVideoUrl);

    const [newReel] = await db
      .insert(reels)
      .values({
        title: data.title,
        description: data.description || null,
        speaker: data.speaker || null,
        isLdkDai: data.isLdkDai ?? true,
        videoUrl: optimizedVideoUrl,
        thumbnailUrl: posterUrl || null,
        duration: data.duration || null,
        orderIndex: data.orderIndex || 0,
        status: data.status,
      })
      .returning();

    await logActivity({
      action: "CREATE",
      entityType: "REELS",
      entityName: newReel.title,
      details: `Menambahkan reels dakwah: ${newReel.title}`,
    });

    revalidatePublic("/reels", "/", "/admin/reels");

    return NextResponse.json({ data: newReel, message: "Reels dakwah berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/reels error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
