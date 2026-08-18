import { NextResponse } from "next/server";
import { db } from "@/db";
import { periods } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { logActivity } from "@/lib/logger";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized", errors: [] }, { status: 401 });
    }

    if (session.user.role === 'ADMIN_BIDANG') {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Hanya Ketua atau Super Admin yang dapat mengubah status pembukaan rekrutmen.", errors: [] },
        { status: 403 }
      );
    }

    const { id } = await params;
    const periodId = parseInt(id, 10);
    
    if (isNaN(periodId)) {
      return NextResponse.json({ success: false, message: "ID periode tidak valid", errors: [] }, { status: 400 });
    }

    const body = await req.json();
    const schema = z.object({
      isOpen: z.boolean(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      
    try {
      await logActivity({
        action: "UPDATE",
        entityType: "PERIODS_[ID]_RECRUITMENT_STATUS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }

    const existingPeriod = await db.query.periods.findFirst({
      where: eq(periods.id, periodId)
    });

    if (!existingPeriod) {
      return NextResponse.json({ success: false, message: "Periode tidak ditemukan", errors: [] }, { status: 404 });
    }

    const [updatedData] = await db.update(periods)
      .set({ isRecruitmentOpen: parsed.data.isOpen })
      .where(eq(periods.id, periodId))
      .returning();

    
    try {
      await logActivity({
        action: "UPDATE",
        entityType: "PERIODS_[ID]_RECRUITMENT_STATUS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({
      success: true,
      message: `Pendaftaran rekrutmen berhasil ${parsed.data.isOpen ? 'dibuka' : 'ditutup'}.`,
      data: updatedData
    });

  } catch (error: any) {
    console.error("Error updating recruitment status in period:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server", errors: [String(error)] },
      { status: 500 }
    );
  }
}
