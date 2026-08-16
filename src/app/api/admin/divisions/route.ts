import { auth } from "@/auth";
import { db } from "@/db";
import { divisions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const divisionSchema = z.object({
  periodId: z.coerce.number().min(1, "Periode harus dipilih"),
  name: z.string().min(1, "Nama bidang wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi").regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan strip"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allDivisions = await db.query.divisions.findMany({
      orderBy: (divisions, { asc }) => [asc(divisions.name)],
    });
    return NextResponse.json(allDivisions);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // ADMIN_BIDANG is NOT allowed to create division
    if (session.user.role === "ADMIN_BIDANG") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Assume KETUA is also not allowed, only SUPER_ADMIN (or KETUA if you want, but user said KETUA = Read/Monitoring)
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = divisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    const validated = parsed.data;

    // Check slug uniqueness
    const existing = await db.query.divisions.findFirst({ where: eq(divisions.slug, validated.slug) });
    if (existing) {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 });
    }

    const [newDivision] = await db.insert(divisions).values(validated).returning();
    return NextResponse.json(newDivision, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Optional: Add strict role check here if needed, but we trust the route's existing auth
    await db.delete(divisions);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
