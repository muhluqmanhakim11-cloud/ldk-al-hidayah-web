import { NextResponse } from "next/server";
import { db } from "@/db";
import { recruitments, recruitmentLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized", errors: [] }, { status: 401 });
    }

    const { id } = await params;
    const recruitmentId = parseInt(id, 10);
    
    if (isNaN(recruitmentId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid", errors: [] }, { status: 400 });
    }

    const body = await req.json();
    const schema = z.object({
      status: z.enum(["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"]),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    
    const newStatus = parsed.data.status;

    // Check RBAC rules for status change
    if (session.user.role === 'ADMIN_BIDANG') {
       if (newStatus === 'ACCEPTED' || newStatus === 'REJECTED') {
         return NextResponse.json(
           { success: false, message: "Admin Bidang tidak berhak melakukan ACCEPT atau REJECT", errors: [] },
           { status: 403 }
         );
       }
    }

    // Fetch existing recruitment to check division ownership
    const existingRecruitment = await db.query.recruitments.findFirst({
      where: eq(recruitments.id, recruitmentId)
    });

    if (!existingRecruitment) {
      return NextResponse.json({ success: false, message: "Data tidak ditemukan", errors: [] }, { status: 404 });
    }

    // Division isolation check for ADMIN_BIDANG
    if (session.user.role === 'ADMIN_BIDANG') {
      if (existingRecruitment.interestedDivisionId !== session.user.divisionId) {
        return NextResponse.json(
           { success: false, message: "Anda tidak berhak mengakses data dari divisi lain", errors: [] },
           { status: 403 }
         );
      }
    }

    const oldStatus = existingRecruitment.status;

    if (oldStatus === newStatus) {
      return NextResponse.json({ success: true, message: "Status tidak berubah", data: existingRecruitment });
    }

    // Perform update and log in a transaction
    const [updatedData] = await db.transaction(async (tx) => {
      const [updated] = await tx.update(recruitments)
        .set({ status: newStatus as "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED" })
        .where(eq(recruitments.id, recruitmentId))
        .returning();

      await tx.insert(recruitmentLogs).values({
        recruitmentId,
        oldStatus,
        newStatus: newStatus as "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED",
        changedBy: parseInt(session.user.id as string, 10),
      });

      return [updated];
    });

    return NextResponse.json({
      success: true,
      message: "Status berhasil diupdate",
      data: updatedData
    });

  } catch (error: any) {
    console.error("Error updating recruitment status:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server", errors: [String(error)] },
      { status: 500 }
    );
  }
}
