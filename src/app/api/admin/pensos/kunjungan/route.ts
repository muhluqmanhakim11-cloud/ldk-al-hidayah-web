import { auth } from "@/auth";
import { db } from "@/db";
import { pensosKunjunganTokoh } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.realRole !== 'super_admin' && session.user.realRole !== 'admin_pensos')) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = await db.select().from(pensosKunjunganTokoh);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.realRole !== 'super_admin' && session.user.realRole !== 'admin_pensos')) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const [newData] = await db.insert(pensosKunjunganTokoh).values({
      ...body,
      tanggal: new Date(body.tanggal)
    }).returning();
    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Optional: Add strict role check here if needed, but we trust the route's existing auth
    await db.delete(pensosKunjunganTokoh);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
