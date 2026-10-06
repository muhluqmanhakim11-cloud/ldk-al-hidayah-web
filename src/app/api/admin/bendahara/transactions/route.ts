import { auth } from "@/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.realRole !== "super_admin" && session.user.realRole !== "admin_bendahara")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await db.select().from(transactions).orderBy(desc(transactions.date));
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.realRole !== "super_admin" && session.user.realRole !== "admin_bendahara")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const [newData] = await db.insert(transactions).values({
      type: body.type,
      category: body.category,
      amount: body.amount,
      date: new Date(body.date),
      description: body.description,
      proofUrl: body.proofUrl || null,
      recordedBy: parseInt(session.user.id),
      periodId: body.periodId || null,
    }).returning();
    
    try {
      await logActivity({
        action: "CREATE",
        entityType: "TRANSACTION",
        entityName: body.description,
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    
    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
