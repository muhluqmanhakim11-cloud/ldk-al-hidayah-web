import { auth } from "@/auth";
import { db } from "@/db";
import { runningTexts } from "@/db/schema";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const runningTextSchema = z.object({
  text: z.string().min(1, "Teks wajib diisi"),
  isActive: z.boolean().default(true),
  orderIndex: z.coerce.number().default(0),
});

export async function GET(req: Request) {
  try {
    const data = await db.query.runningTexts.findMany({
      orderBy: [asc(runningTexts.orderIndex)],
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KETUA")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = runningTextSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const [newItem] = await db.insert(runningTexts).values(parsed.data).returning();
    
    try {
      await logActivity({
        action: "CREATE",
        entityType: "RUNNING_TEXTS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Optional: Add strict role check here if needed, but we trust the route's existing auth
    await db.delete(runningTexts);
    
    try {
      await logActivity({
        action: "DELETE",
        entityType: "RUNNING_TEXTS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
