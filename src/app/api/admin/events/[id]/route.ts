import { auth } from "@/auth";
import { db } from "@/db";
import { events, programs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const eventSchema = z.object({
  name: z.string().min(1, "Nama kegiatan wajib diisi"),
  periodId: z.coerce.number().min(1, "Periode wajib diisi"),
  divisionId: z.coerce.number().min(1, "Bidang wajib diisi"),
  programId: z.coerce.number().min(1, "Program kerja wajib diisi"),
  date: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED", "UPCOMING", "ONGOING", "DONE"]).default("PUBLISHED"),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    if (session.user.role === "KETUA") {
      return NextResponse.json({ error: "Forbidden: KETUA hanya dapat melihat data" }, { status: 403 });
    }

    const id = parseInt((await params).id);
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      
    try {
      await logActivity({
        action: "UPDATE",
        entityType: "EVENTS",
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

    const existingEvent = await db.query.events.findFirst({ where: eq(events.id, id) });
    if (!existingEvent) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    // Verify program ownership from DB
    const program = await db.query.programs.findFirst({
      where: eq(programs.id, validated.programId)
    });

    if (!program) {
      return NextResponse.json({ error: "Program Kerja tidak ditemukan" }, { status: 404 });
    }

    if (program.divisionId !== validated.divisionId) {
      return NextResponse.json({ error: "Program Kerja tidak cocok dengan bidang yang dipilih" }, { status: 400 });
    }

    if (session.user.role === "ADMIN_BIDANG") {
      // 1. Existing event must belong to their division
      if (existingEvent.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Anda tidak dapat mengubah kegiatan milik bidang lain" }, { status: 403 });
      }
      // 2. Cannot reassign it to a fake division
      if (validated.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Anda tidak dapat memindahkan kegiatan ke bidang lain" }, { status: 403 });
      }
      // 3. New program must belong to their division
      if (program.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Program Kerja bukan milik bidang Anda" }, { status: 403 });
      }
    }

    let dateObj = null;
    if (validated.date) {
      dateObj = new Date(validated.date);
    }

    const [updated] = await db.update(events).set({
      ...validated,
      date: dateObj,
      updatedAt: new Date()
    }).where(eq(events.id, id)).returning();
    
    
    try {
      await logActivity({
        action: "UPDATE",
        entityType: "EVENTS",
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
    
    if (session.user.role === "KETUA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = parseInt((await params).id);
    const existingEvent = await db.query.events.findFirst({ where: eq(events.id, id) });
    
    if (!existingEvent) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    if (session.user.role === "ADMIN_BIDANG") {
      if (existingEvent.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Anda tidak dapat menghapus kegiatan milik bidang lain" }, { status: 403 });
      }
    }

    await db.delete(events).where(eq(events.id, id));
    
    try {
      await logActivity({
        action: "DELETE",
        entityType: "EVENTS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
