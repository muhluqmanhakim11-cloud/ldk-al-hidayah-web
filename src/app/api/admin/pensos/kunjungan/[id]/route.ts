import { auth } from "@/auth";
import { db } from "@/db";
import { pensosKunjunganTokoh } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user.realRole !== 'super_admin' && session.user.realRole !== 'admin_pensos')) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    await db.delete(pensosKunjunganTokoh).where(eq(pensosKunjunganTokoh.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
