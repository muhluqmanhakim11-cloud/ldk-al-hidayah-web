import { auth } from "@/auth";
import { db } from "@/db";
import { recruitments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["SUPER_ADMIN", "KETUA"];
    if (!allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const recruitmentId = parseInt(id, 10);

    if (isNaN(recruitmentId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    await db.delete(recruitments).where(eq(recruitments.id, recruitmentId));

    try {
      await logActivity({
        action: "DELETE",
        entityType: "RECRUITMENT",
        entityName: `Recruitment ID ${recruitmentId}`,
        divisionId: session?.user?.divisionId || null,
      });
    } catch (e) {}

    return NextResponse.json({ success: true, message: "Data pendaftar berhasil dihapus" });
  } catch (error) {
    console.error("DELETE recruitment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
