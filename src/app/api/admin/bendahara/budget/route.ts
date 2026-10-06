import { auth } from "@/auth";
import { db } from "@/db";
import { budgetAllocations } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await db.select().from(budgetAllocations).orderBy(budgetAllocations.category as any);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !["super_admin", "admin_bendahara"].includes((session.user as any).realRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const [newData] = await db.insert(budgetAllocations).values({
      category: body.category,
      amount: body.amount,
      periodId: body.periodId || null,
    }).returning();
    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
