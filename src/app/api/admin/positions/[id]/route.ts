import { auth } from "@/auth";
import { db } from "@/db";
import { positions, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const positionSchema = z.object({
  name: z.string().min(1, "Nama jabatan wajib diisi"),
  level: z.coerce.number().default(0),
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
    const parsed = positionSchema.safeParse(body);
    if (!parsed.success) {
      
    try {
      await logActivity({
        action: "UPDATE",
        entityType: "POSITIONS",
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

    const [updated] = await db.update(positions).set(validated).where(eq(positions.id, id)).returning();
    
    try {
      await logActivity({
        action: "UPDATE",
        entityType: "POSITIONS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
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
    const relatedMembers = await db.query.members.findFirst({ where: eq(members.positionId, id) });
    
    if (relatedMembers) {
      return NextResponse.json({ error: "Jabatan ini masih memiliki data pengurus yang terkait." }, { status: 400 });
    }

    await db.delete(positions).where(eq(positions.id, id));
    
    try {
      await logActivity({
        action: "DELETE",
        entityType: "POSITIONS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
