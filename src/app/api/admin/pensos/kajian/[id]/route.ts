import { auth } from "@/auth";
import { db } from "@/db";
import { pensosKajianKelas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user.realRole !== "super_admin" && session.user.realRole !== "admin_pensos")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db.delete(pensosKajianKelas).where(eq(pensosKajianKelas.id, parseInt(id)));
    
    
    try {
      await logActivity({
        action: "DELETE",
        entityType: "PENSOS_KAJIAN",
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
