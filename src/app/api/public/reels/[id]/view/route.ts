import { db } from "@/db";
import { reels } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reelId = parseInt(id);

    if (isNaN(reelId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const [updated] = await db
      .update(reels)
      .set({
        viewsCount: sql`${reels.viewsCount} + 1`,
      })
      .where(eq(reels.id, reelId))
      .returning({ id: reels.id, viewsCount: reels.viewsCount });

    if (!updated) {
      return NextResponse.json({ error: "Reel tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, viewsCount: updated.viewsCount });
  } catch (error) {
    console.error("POST /api/public/reels/[id]/view error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
