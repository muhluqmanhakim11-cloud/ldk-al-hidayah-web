import { db } from "@/db";
import { reels } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await db
      .select({
        id: reels.id,
        title: reels.title,
        description: reels.description,
        speaker: reels.speaker,
        videoUrl: reels.videoUrl,
        thumbnailUrl: reels.thumbnailUrl,
        duration: reels.duration,
        likesCount: reels.likesCount,
        viewsCount: reels.viewsCount,
        createdAt: reels.createdAt,
      })
      .from(reels)
      .where(eq(reels.status, "PUBLISHED"))
      .orderBy(asc(reels.orderIndex), desc(reels.createdAt));

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("GET /api/public/reels error:", error);
    return NextResponse.json({ error: "Gagal memuat reels" }, { status: 500 });
  }
}

