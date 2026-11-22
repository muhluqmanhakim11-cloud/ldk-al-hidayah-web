import { auth } from "@/auth";
import { db } from "@/db";
import { reels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/logger";
import { revalidatePublic } from "@/lib/revalidate";
import { getOptimizedVideoUrl, getVideoPosterUrl } from "@/lib/video-optimization";

const reelUpdateSchema = z.object({
  title: z.string().min(1, "Judul reels wajib diisi").max(255).optional(),
  description: z.string().optional().nullable(),
  speaker: z.string().optional().nullable(),
  isLdkDai: z.boolean().optional(),
  videoUrl: z.string().url("URL video harus valid").optional(),
  thumbnailUrl: z.string().optional().nullable(),
  duration: z.coerce.number().optional().nullable(),
  orderIndex: z.coerce.number().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const reelId = parseInt(id);

    const [reel] = await db.select().from(reels).where(eq(reels.id, reelId)).limit(1);
    if (!reel) {
      return NextResponse.json({ error: "Reel tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: reel });
  } catch (error) {
    console.error("GET /api/admin/reels/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const reelId = parseInt(id);

    const [existing] = await db.select().from(reels).where(eq(reels.id, reelId)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Reel tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const validated = reelUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Data tidak valid" },
        { status: 400 }
      );
    }

    const data = validated.data;
    const updateValues: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateValues.title = data.title;
    if (data.description !== undefined) updateValues.description = data.description;
    if (data.speaker !== undefined) updateValues.speaker = data.speaker;
    if (data.isLdkDai !== undefined) updateValues.isLdkDai = data.isLdkDai;
    if (data.videoUrl !== undefined) {
      const optimized = getOptimizedVideoUrl(data.videoUrl);
      updateValues.videoUrl = optimized;
      if (!data.thumbnailUrl && !existing.thumbnailUrl) {
        updateValues.thumbnailUrl = getVideoPosterUrl(optimized);
      }
    }
    if (data.thumbnailUrl !== undefined) updateValues.thumbnailUrl = data.thumbnailUrl;
    if (data.duration !== undefined) updateValues.duration = data.duration;
    if (data.orderIndex !== undefined) updateValues.orderIndex = data.orderIndex;
    if (data.status !== undefined) updateValues.status = data.status;

    const [updated] = await db
      .update(reels)
      .set(updateValues)
      .where(eq(reels.id, reelId))
      .returning();

    await logActivity({
      action: "UPDATE",
      entityType: "REELS",
      entityName: updated.title,
      details: `Memperbarui reels dakwah: ${updated.title}`,
    });

    revalidatePublic("/reels", "/", "/admin/reels");

    return NextResponse.json({ data: updated, message: "Reels berhasil diperbarui" });
  } catch (error) {
    console.error("PATCH /api/admin/reels/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const reelId = parseInt(id);

    const [existing] = await db.select().from(reels).where(eq(reels.id, reelId)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Reel tidak ditemukan" }, { status: 404 });
    }

    await db.delete(reels).where(eq(reels.id, reelId));

    await logActivity({
      action: "DELETE",
      entityType: "REELS",
      entityName: existing.title,
      details: `Menghapus reels dakwah: ${existing.title}`,
    });

    revalidatePublic("/reels", "/", "/admin/reels");

    return NextResponse.json({ message: "Reels berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/admin/reels/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
