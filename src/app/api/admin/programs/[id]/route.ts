import { auth } from "@/auth";
import { db } from "@/db";
import { programs, events } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const programSchema = z.object({
  name: z.string().min(1, "Nama program wajib diisi"),
  slug: z.string().optional().nullable(),
  periodId: z.coerce.number().min(1, "Periode wajib diisi"),
  divisionId: z.coerce.number().min(1, "Bidang wajib diisi"),
  description: z.string().optional().nullable(),
  objective: z.string().optional().nullable(),
  schedule: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"]).default("PUBLISHED"),
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
    const parsed = programSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    const validated = parsed.data;

    const existingProgram = await db.query.programs.findFirst({ where: eq(programs.id, id) });
    if (!existingProgram) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    if (session.user.role === "ADMIN_BIDANG") {
      // Must be editing a program in their own division
      if (existingProgram.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Anda tidak dapat mengubah program milik bidang lain" }, { status: 403 });
      }
      // Cannot reassign it to another division
      if (validated.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Anda tidak dapat memindahkan program ke bidang lain" }, { status: 403 });
      }
    }

    if (validated.slug) {
      const existingSlug = await db.query.programs.findFirst({
        where: and(eq(programs.slug, validated.slug), ne(programs.id, id)),
      });
      if (existingSlug) {
        return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 });
      }
    }

    const [updated] = await db.update(programs).set({ ...validated, updatedAt: new Date() }).where(eq(programs.id, id)).returning();
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
    const existingProgram = await db.query.programs.findFirst({ where: eq(programs.id, id) });
    
    if (!existingProgram) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    if (session.user.role === "ADMIN_BIDANG") {
      if (existingProgram.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Anda tidak dapat menghapus program milik bidang lain" }, { status: 403 });
      }
    }
    
    // Protection: check if program has events
    const relatedEvents = await db.query.events.findFirst({ where: eq(events.programId, id) });
    if (relatedEvents) {
      return NextResponse.json({ error: "Program ini tidak dapat dihapus karena masih memiliki data kegiatan terkait." }, { status: 400 });
    }

    await db.delete(programs).where(eq(programs.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
