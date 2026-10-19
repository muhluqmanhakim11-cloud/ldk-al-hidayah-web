import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { mitra } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT - update mitra
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nama, logoUrl, websiteUrl, isActive, orderIndex } = body;
    const [updated] = await db.update(mitra)
      .set({ nama, logoUrl, websiteUrl: websiteUrl || null, isActive, orderIndex, updatedAt: new Date() })
      .where(eq(mitra.id, parseInt(id)))
      .returning();
    if (!updated) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal update mitra" }, { status: 500 });
  }
}

// DELETE - hapus mitra
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(mitra).where(eq(mitra.id, parseInt(id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal hapus mitra" }, { status: 500 });
  }
}
