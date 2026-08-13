import { NextResponse } from "next/server";
import { db } from "@/db";
import { periods } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const activePeriod = await db.query.periods.findFirst({
      where: eq(periods.isActive, true),
      orderBy: (p, { desc }) => [desc(p.id)],
    });

    if (!activePeriod) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada periode aktif",
        data: { isOpen: false, period: null }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Status rekrutmen berhasil diambil",
      data: {
        isOpen: activePeriod.isRecruitmentOpen,
        period: {
          id: activePeriod.id,
          name: activePeriod.name,
        }
      }
    });
  } catch (error) {
    console.error("Error fetching recruitment status:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server", errors: [String(error)] },
      { status: 500 }
    );
  }
}
