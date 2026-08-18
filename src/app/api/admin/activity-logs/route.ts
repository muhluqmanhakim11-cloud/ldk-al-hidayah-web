import { auth } from "@/auth";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const u = session?.user as any;
    if (!session || (u.role !== "SUPER_ADMIN" && u.realRole !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    let divisionId = url.searchParams.get("divisionId");

    const conditions = [];
    if (divisionId) {
      conditions.push(eq(activityLogs.divisionId, parseInt(divisionId)));
    }

    const queryWhere = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db.query.activityLogs.findMany({
      where: queryWhere,
      limit,
      orderBy: [desc(activityLogs.createdAt)],
      with: {
        user: true,
        division: true,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
