import { auth } from "@/auth";
import { db } from "@/db";
import { members } from "@/db/schema";
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

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

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = session.user.role;
    const userDivisionId = session.user.divisionId;

    let allMembers;
    
    if (userRole === "ADMIN_BIDANG") {
      // Admin Bidang only gets members from their division (or we can return all if we just want them to view, but user said "akses terbatas sesuai division_id")
      // Let's just return all for viewing, but restrict actions. Or restrict viewing? 
      // "ADMIN_BIDANG hanya melihat/mengelola data yang berkaitan dengan division_id miliknya"
      allMembers = await db.query.members.findMany({
        where: eq(members.divisionId, userDivisionId as number),
        with: {
          period: true,
          position: true,
          division: true,
        },
        orderBy: (members, { asc }) => [asc(members.name)],
      });
    } else {
      allMembers = await db.query.members.findMany({
        with: {
          period: true,
          position: true,
          division: true,
        },
        orderBy: (members, { asc }) => [asc(members.name)],
      });
    }

    return NextResponse.json(allMembers);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const userRole = session.user.role;
    const userDivisionId = session.user.divisionId;
    
    if (userRole === "KETUA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = memberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    const validated = parsed.data;

    if (userRole === "ADMIN_BIDANG") {
      if (validated.divisionId !== userDivisionId) {
        return NextResponse.json({ error: "Anda hanya dapat menambah pengurus untuk bidang Anda sendiri." }, { status: 403 });
      }
    }

    const [newMember] = await db.insert(members).values(validated).returning();
    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
