import { auth } from "@/auth";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const memberSchema = z.object({
  periodId: z.coerce.number().min(1, "Periode harus dipilih"),
  positionId: z.coerce.number().min(1, "Jabatan harus dipilih"),
  divisionId: z.coerce.number().optional().nullable(),
  name: z.string().min(1, "Nama pengurus wajib diisi"),
  nim: z.string().optional().nullable(),
  email: z.string().email("Format email tidak valid").optional().nullable().or(z.literal("")),
  contact: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const userRole = session.user.role;
    const userDivisionId = session.user.divisionId;
    
    if (userRole === "KETUA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = parseInt((await params).id);
    const body = await req.json();
    const parsed = memberSchema.safeParse(body);
    if (!parsed.success) {
      
    try {
      await logActivity({
        action: "UPDATE",
        entityType: "MEMBERS",
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

    const existingMember = await db.query.members.findFirst({ where: eq(members.id, id) });
    if (!existingMember) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    if (userRole === "ADMIN_BIDANG") {
      // Must be editing someone in their own division
      if (existingMember.divisionId !== userDivisionId) {
        return NextResponse.json({ error: "Forbidden: Anda tidak dapat mengubah pengurus di bidang lain." }, { status: 403 });
      }
      // Also cannot reassign them to another division
      if (validated.divisionId !== userDivisionId) {
        return NextResponse.json({ error: "Forbidden: Anda tidak dapat memindahkan pengurus ke bidang lain." }, { status: 403 });
      }
    }

    const [updated] = await db.update(members).set(validated).where(eq(members.id, id)).returning();
    
    try {
      await logActivity({
        action: "UPDATE",
        entityType: "MEMBERS",
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
    
    const userRole = session.user.role;
    const userDivisionId = session.user.divisionId;
    
    if (userRole === "KETUA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = parseInt((await params).id);
    
    if (userRole === "ADMIN_BIDANG") {
      const existingMember = await db.query.members.findFirst({ where: eq(members.id, id) });
      if (!existingMember || existingMember.divisionId !== userDivisionId) {
        return NextResponse.json({ error: "Forbidden: Anda tidak dapat menghapus pengurus di bidang lain." }, { status: 403 });
      }
    }

    await db.delete(members).where(eq(members.id, id));
    
    try {
      await logActivity({
        action: "DELETE",
        entityType: "MEMBERS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
