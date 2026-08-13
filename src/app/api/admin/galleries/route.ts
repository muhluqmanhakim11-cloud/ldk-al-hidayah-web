import { auth } from "@/auth";
import { db } from "@/db";
import { galleries, events, galleryImages } from "@/db/schema";
import { eq, and, ilike, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const gallerySchema = z.object({
  title: z.string().min(1, "Judul galeri wajib diisi"),
  eventId: z.coerce.number().optional().nullable(),
  divisionId: z.coerce.number().min(1, "Bidang wajib diisi"),
  periodId: z.coerce.number().min(1, "Periode wajib diisi"),
  description: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
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

    if (periodId) conditions.push(eq(galleries.periodId, parseInt(periodId)));
    if (divisionId) conditions.push(eq(galleries.divisionId, parseInt(divisionId)));
    if (status) conditions.push(eq(galleries.status, status as any));
    if (search) conditions.push(ilike(galleries.title, `%${search}%`));

    const queryWhere = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db.query.galleries.findMany({
      where: queryWhere,
      limit,
      offset,
      with: { 
        period: true, 
        division: true, 
        event: true,
        images: true
      },
      orderBy: [desc(galleries.id)],
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
    const parsed = gallerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    const validated = parsed.data;

    // Consistency Check
    if (validated.eventId) {
      const event = await db.query.events.findFirst({
        where: eq(events.id, validated.eventId)
      });
      if (!event) {
        return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
      }
      
      // Override to ensure consistency
      validated.divisionId = event.divisionId!;
      validated.periodId = event.periodId;
    }

    if (session.user.role === "ADMIN_BIDANG") {
      if (validated.divisionId !== session.user.divisionId) {
        return NextResponse.json({ error: "Forbidden: Galeri harus milik bidang Anda" }, { status: 403 });
      }
    }

    const [newGallery] = await db.insert(galleries).values(validated).returning();
    return NextResponse.json(newGallery, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
