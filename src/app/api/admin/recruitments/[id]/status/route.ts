import { NextResponse } from "next/server";
import { db } from "@/db";
import { recruitments, recruitmentLogs, kaderDatabase, members, periods, positions, divisions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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
    if ((session.user as any).role === 'ADMIN_BIDANG') {
       if (newStatus === 'ACCEPTED' || newStatus === 'REJECTED') {
         return NextResponse.json(
           { success: false, message: "Admin Bidang tidak berhak melakukan ACCEPT atau REJECT", errors: [] },
           { status: 403 }
         );
       }
    }

    // Fetch existing recruitment
    const existingRecruitments = await db.select().from(recruitments).where(eq(recruitments.id, recruitmentId)).limit(1);
    const existingRecruitment = existingRecruitments[0];

    if (!existingRecruitment) {
      return NextResponse.json({ success: false, message: "Data tidak ditemukan", errors: [] }, { status: 404 });
    }

    // Division isolation check for ADMIN_BIDANG
    if ((session.user as any).role === 'ADMIN_BIDANG') {
      if (existingRecruitment.interestedDivisionId !== (session.user as any).divisionId) {
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

    // Update recruitment status
    const [updatedData] = await db.update(recruitments)
      .set({ status: newStatus as "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED" })
      .where(eq(recruitments.id, recruitmentId))
      .returning();

    // Log the status change
    await db.insert(recruitmentLogs).values({
      recruitmentId,
      oldStatus,
      newStatus: newStatus as "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED",
      changedBy: parseInt((session.user as any).id as string, 10),
    });

    // ── AUTO INSERT: REVIEWED → Database Kader ──────────────────────────────
    if (newStatus === "REVIEWED") {
      try {
        // Cek apakah NIM sudah ada di database kader (hindari duplikat)
        const existing = await db.select().from(kaderDatabase)
          .where(eq(kaderDatabase.nim, existingRecruitment.nim))
          .limit(1);

        if (existing.length === 0) {
          // Dapatkan nama divisi (jika ada)
          let divisiName: string | null = null;
          if (existingRecruitment.interestedDivisionId) {
            const divRows = await db.query.divisions.findFirst({
              where: eq(divisions.id, existingRecruitment.interestedDivisionId)
            });
            divisiName = divRows?.name ?? null;
          }

          await db.insert(kaderDatabase).values({
            nim: existingRecruitment.nim,
            nama: existingRecruitment.name,
            prodiAngkatan: existingRecruitment.studyProgram ?? null,
            noWa: existingRecruitment.whatsapp ?? null,
            divisi: divisiName,
            statusKaderisasi: "Calon Kader",
          });
        }
      } catch (e) {
        console.warn("Auto-insert kader_database failed:", e);
        // Non-fatal: status sudah berhasil diubah, insert kader hanya warning
      }
    }

    // ── AUTO INSERT: ACCEPTED → Data Pengurus (members) ─────────────────────
    if (newStatus === "ACCEPTED") {
      try {
        // Dapatkan period aktif
        const activePeriods = await db.select().from(periods)
          .where(eq(periods.isActive, true))
          .limit(1);
        const activePeriod = activePeriods[0];

        if (activePeriod) {
          // Cari posisi "Anggota" (default), kalau tidak ada ambil posisi pertama
          const allPositions = await db.select().from(positions).limit(10);
          const anggotaPos = allPositions.find(p => 
            p.name.toLowerCase().includes("anggota") || p.name.toLowerCase().includes("member")
          ) ?? allPositions[0];

          if (anggotaPos) {
            // Cek apakah sudah ada member dengan NIM ini di periode aktif (hindari duplikat)
            const existingMember = await db.select().from(members)
              .where(and(
                eq(members.periodId, activePeriod.id),
                eq(members.nim, existingRecruitment.nim)
              ))
              .limit(1);

            if (existingMember.length === 0) {
              await db.insert(members).values({
                periodId: activePeriod.id,
                name: existingRecruitment.name,
                nim: existingRecruitment.nim,
                email: existingRecruitment.email ?? null,
                contact: existingRecruitment.whatsapp ?? null,
                positionId: anggotaPos.id,
                divisionId: existingRecruitment.interestedDivisionId ?? null,
                photoUrl: existingRecruitment.photoUrl ?? null,
              });
            }
          }
        }
      } catch (e) {
        console.warn("Auto-insert members failed:", e);
        // Non-fatal: status sudah berhasil diubah, insert member hanya warning
      }
    }

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
