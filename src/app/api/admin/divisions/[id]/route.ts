import { auth } from "@/auth";
import { db } from "@/db";
import { divisions, members } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const divisionSchema = z.object({
  periodId: z.coerce.number().min(1, "Periode harus dipilih"),
  name: z.string().min(1, "Nama bidang wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi").regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan strip"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
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
    const parsed = divisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    const validated = parsed.data;

    const existingSlug = await db.query.divisions.findFirst({
      where: and(eq(divisions.slug, validated.slug), ne(divisions.id, id)),
    });
    if (existingSlug) {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 });
    }

    const [updated] = await db.update(divisions).set(validated).where(eq(divisions.id, id)).returning();
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
    const relatedMembers = await db.query.members.findFirst({ where: eq(members.divisionId, id) });
    
    if (relatedMembers) {
      return NextResponse.json({ error: "Bidang ini masih memiliki data pengurus yang terkait." }, { status: 400 });
    }

    await db.delete(divisions).where(eq(divisions.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
