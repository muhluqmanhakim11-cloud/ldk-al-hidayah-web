import { auth } from "@/auth";
import { db } from "@/db";
import { donors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await db.select().from(donors).orderBy(donors.name as any);
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
    const [newData] = await db.insert(donors).values({
      name: body.name,
      contact: body.contact || null,
      email: body.email || null,
      notes: body.notes || null,
    }).returning();
    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
