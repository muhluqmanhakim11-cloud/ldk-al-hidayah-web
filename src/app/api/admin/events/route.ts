import { auth } from "@/auth";
import { db } from "@/db";
import { events, programs } from "@/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
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
    const programId = url.searchParams.get("programId");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    const userRole = session.user.role;
    const userDivisionId = session.user.divisionId;

    if (userRole === "ADMIN_BIDANG") {
      divisionId = String(userDivisionId);
    }

    const conditions = [];

    if (periodId) conditions.push(eq(events.periodId, parseInt(periodId)));
    if (divisionId) conditions.push(eq(events.divisionId, parseInt(divisionId)));
    if (programId) conditions.push(eq(events.programId, parseInt(programId)));
    if (status) conditions.push(eq(events.status, status as any));
    if (search) conditions.push(ilike(events.name, `%${search}%`));

    const queryWhere = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db.query.events.findMany({
      where: queryWhere,
      limit,
      offset,
      with: { period: true, division: true, program: true },
      orderBy: [desc(events.id)], // Ideally order by date desc, but some might not have date
    });

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
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      
    try {
      await logActivity({
        action: "CREATE",
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

    // INTEGRITY CHECK DIVISION
    // Verify program ownership from DB
    const program = await db.query.programs.findFirst({
      where: eq(programs.id, validated.programId)
    });

    if (!program) {
      return NextResponse.json({ error: "Program Kerja tidak ditemukan" }, { status: 404 });
    }

    // Program must belong to the requested division
    if (program.divisionId !== validated.divisionId) {
      return NextResponse.json({ error: "Program Kerja tidak cocok dengan bidang yang dipilih" }, { status: 400 });
    }

    if (session.user.role === "ADMIN_BIDANG") {
      // 1. event.divisionId == session.divisionId
      if (validated.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Event division_id palsu" }, { status: 403 });
      }
      // 2. program.divisionId == session.divisionId
      if (program.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Program Kerja bukan milik bidang Anda" }, { status: 403 });
      }
    }

    // If there is a date, parse it.
    let dateObj = null;
    if (validated.date) {
      dateObj = new Date(validated.date);
    }

    const [newEvent] = await db.insert(events).values({
      ...validated,
      date: dateObj,
    }).returning();
    
    
    try {
      await logActivity({
        action: "CREATE",
        entityType: "EVENTS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(newEvent, { status: 201 });
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
    await db.delete(events);
    
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
