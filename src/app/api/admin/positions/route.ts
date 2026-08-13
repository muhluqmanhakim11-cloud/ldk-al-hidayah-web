import { auth } from "@/auth";
import { db } from "@/db";
import { positions } from "@/db/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

const positionSchema = z.object({
  name: z.string().min(1, "Nama jabatan wajib diisi"),
  level: z.coerce.number().default(0),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allPositions = await db.query.positions.findMany({
      orderBy: (positions, { asc }) => [asc(positions.level)],
    });
    return NextResponse.json(allPositions);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = positionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    const validated = parsed.data;

    const [newPosition] = await db.insert(positions).values(validated).returning();
    return NextResponse.json(newPosition, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
