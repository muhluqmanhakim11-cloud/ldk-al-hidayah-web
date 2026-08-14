import { auth } from "@/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  content: z.string().min(1, "Konten wajib diisi"),
  imageUrl: z.string().nullable().optional(),
  orderIndex: z.coerce.number().default(0),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
});

export async function GET(req: Request) {
  try {
    const data = await db.query.profiles.findMany({
      orderBy: [asc(profiles.orderIndex)],
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KETUA")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const [newProfile] = await db.insert(profiles).values(parsed.data).returning();
    return NextResponse.json(newProfile, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
