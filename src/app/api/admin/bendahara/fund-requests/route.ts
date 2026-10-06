import { auth } from "@/auth";
import { db } from "@/db";
import { fundRequests, transactions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await db.select().from(fundRequests).orderBy(desc(fundRequests.createdAt));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const [newData] = await db.insert(fundRequests).values({
      title: body.title,
      description: body.description,
      amount: body.amount,
      requestedBy: parseInt(session.user.id),
      divisionId: session.user.divisionId || null,
      status: "PENDING",
    }).returning();
    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
