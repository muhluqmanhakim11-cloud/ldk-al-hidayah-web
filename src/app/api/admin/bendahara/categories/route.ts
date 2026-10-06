import { auth } from "@/auth";
import { db } from "@/db";
import { transactionCategories } from "@/db/schema";
import { NextResponse } from "next/server";

const BENDAHARA_ROLES = ["super_admin", "admin_bendahara"];

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await db.select().from(transactionCategories).orderBy(transactionCategories.type, transactionCategories.name as any);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !BENDAHARA_ROLES.includes((session.user as any).realRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const [newData] = await db.insert(transactionCategories).values({
      name: body.name,
      type: body.type,
    }).returning();
    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
