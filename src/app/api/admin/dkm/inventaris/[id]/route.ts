import { auth } from "@/auth";
import { db } from "@/db";
import { dkmInventaris } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user.realRole !== "super_admin" && session.user.realRole !== "admin_dkm")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db.delete(dkmInventaris).where(eq(dkmInventaris.id, parseInt(id)));
    
    
    try {
      await logActivity({
        action: "DELETE",
        entityType: "DKM_INVENTARIS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user.realRole !== "super_admin" && session.user.realRole !== "admin_dkm")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { kodeBarang, namaBarang, kondisi, jumlah, lokasi, tglAudit } = body;

    await db.update(dkmInventaris)
      .set({
        kodeBarang,
        namaBarang,
        kondisi,
        jumlah,
        lokasi,
        tglAudit: new Date(tglAudit),
      })
      .where(eq(dkmInventaris.id, parseInt(id)));

    try {
      await logActivity({
        action: "UPDATE",
        entityType: "DKM_INVENTARIS",
        entityName: namaBarang,
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
