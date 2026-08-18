import { auth } from "@/auth";
import { db } from "@/db";
import { periods, divisions, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const periodSchema = z.object({
  name: z.string().min(1, "Nama periode wajib diisi"),
  isActive: z.boolean().default(false),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = parseInt((await params).id);
    const body = await req.json();
    const parsed = periodSchema.safeParse(body);
    if (!parsed.success) {
      
    try {
      await logActivity({
        action: "UPDATE",
        entityType: "PERIODS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    const validated = parsed.data;

    if (validated.isActive) {
      await db.update(periods).set({ isActive: false });
    }

    const [updated] = await db.update(periods).set(validated).where(eq(periods.id, id)).returning();
    
    try {
      await logActivity({
        action: "UPDATE",
        entityType: "PERIODS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = parseInt((await params).id);
    
    // Protection: check relations
    const relatedDivisions = await db.query.divisions.findFirst({ where: eq(divisions.periodId, id) });
    const relatedMembers = await db.query.members.findFirst({ where: eq(members.periodId, id) });
    
    if (relatedDivisions || relatedMembers) {
      return NextResponse.json({ error: "Periode ini masih memiliki data bidang atau pengurus yang terkait." }, { status: 400 });
    }

    await db.delete(periods).where(eq(periods.id, id));
    
    try {
      await logActivity({
        action: "DELETE",
        entityType: "PERIODS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
