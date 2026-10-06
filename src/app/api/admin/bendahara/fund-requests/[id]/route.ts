import { auth } from "@/auth";
import { db } from "@/db";
import { fundRequests, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !["super_admin", "admin_bendahara"].includes((session.user as any).realRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json(); // { action: 'APPROVED'|'REJECTED', note: string }

    const [updated] = await db.update(fundRequests).set({
      status: body.action,
      note: body.note || null,
      reviewedBy: parseInt(session.user.id),
      reviewedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(fundRequests.id, parseInt(id))).returning();

    // Jika disetujui, otomatis buat transaksi pengeluaran
    if (body.action === "APPROVED" && updated) {
      await db.insert(transactions).values({
        type: "OUT",
        category: "Pengajuan Dana",
        amount: updated.amount,
        date: new Date(),
        description: `[DISETUJUI] ${updated.title}`,
        recordedBy: parseInt(session.user.id),
        periodId: null,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await db.delete(fundRequests).where(eq(fundRequests.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
