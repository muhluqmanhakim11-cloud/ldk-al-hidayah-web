import { auth } from "@/auth";
import { db } from "@/db";
import { programs } from "@/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
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
  status: z.enum(["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"]).default("DRAFT"),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const periodId = url.searchParams.get("periodId");
    let divisionId = url.searchParams.get("divisionId");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    const userRole = session.user.role;
    const userDivisionId = session.user.divisionId;

    if (userRole === "ADMIN_BIDANG") {
      divisionId = String(userDivisionId);
    }

    const conditions = [];

    if (periodId) conditions.push(eq(programs.periodId, parseInt(periodId)));
    if (divisionId) conditions.push(eq(programs.divisionId, parseInt(divisionId)));
    if (status) conditions.push(eq(programs.status, status as any));
    if (search) conditions.push(ilike(programs.name, `%${search}%`));

    const queryWhere = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db.query.programs.findMany({
      where: queryWhere,
      limit,
      offset,
      with: { period: true, division: true },
      orderBy: [desc(programs.id)],
    });

    // We can also count total if needed for pagination, but simplified for now
    // A proper count would require a separate query. Let's do it:
    // Actually we only need data length if it's less than limit to know there's no next page.
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    if (session.user.role === "KETUA") {
      return NextResponse.json({ error: "Forbidden: KETUA hanya dapat melihat data" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = programSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    const validated = parsed.data;

    if (session.user.role === "ADMIN_BIDANG") {
      if (validated.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Anda hanya dapat membuat program untuk bidang Anda sendiri" }, { status: 403 });
      }
    }

    const [newProgram] = await db.insert(programs).values(validated).returning();
    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    // Handle unique constraint error for slug
    if ((error as any).code === '23505') {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
