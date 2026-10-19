import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { mitra } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// GET - list semua mitra aktif
export async function GET() {
  try {
    const list = await db.select().from(mitra).orderBy(asc(mitra.orderIndex), asc(mitra.createdAt));
    return NextResponse.json(list);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengambil data mitra" }, { status: 500 });
  }
}

// POST - tambah mitra baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, logoUrl, websiteUrl, isActive, orderIndex } = body;
    if (!nama || !logoUrl) {
      return NextResponse.json({ error: "Nama dan logo wajib diisi" }, { status: 400 });
    }
    const [inserted] = await db.insert(mitra).values({
      nama,
      logoUrl,
      websiteUrl: websiteUrl || null,
      isActive: isActive ?? true,
      orderIndex: orderIndex ?? 0,
    }).returning();
    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal menambah mitra" }, { status: 500 });
  }
}
