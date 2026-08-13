import { NextResponse } from "next/server";
import { db } from "@/db";
import { recruitments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized", errors: [] }, { status: 401 });
    }

    let queryConditions = undefined;

    if (session.user.role === 'ADMIN_BIDANG') {
      if (!session.user.divisionId) {
         return NextResponse.json({ success: false, message: "Admin bidang tidak memiliki divisi yang valid", errors: [] }, { status: 403 });
      }
      queryConditions = eq(recruitments.interestedDivisionId, session.user.divisionId);
    }

    const data = await db.query.recruitments.findMany({
      where: queryConditions,
      with: {
        period: true,
        interestedDivision: true,
      },
      orderBy: [desc(recruitments.createdAt)],
    });

    return NextResponse.json({
      success: true,
      message: "Data rekrutmen berhasil diambil",
      data
    });
  } catch (error: any) {
    console.error("Error fetching admin recruitments:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal", errors: [String(error)] },
      { status: 500 }
    );
  }
}
