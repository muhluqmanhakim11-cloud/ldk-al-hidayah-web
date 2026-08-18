import { auth } from "@/auth";
import { db } from "@/db";
import { divisionNotes, users } from "@/db/schema";
import { eq, desc, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    
    // Only SUPER_ADMIN and KETUA can view these global notes
    if (user.realRole !== 'super_admin' && user.role !== 'SUPER_ADMIN' && user.role !== 'KETUA') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let data = await db.select({
      id: divisionNotes.id,
      title: divisionNotes.title,
      content: divisionNotes.content,
      divisionId: divisionNotes.divisionId,
      createdBy: divisionNotes.createdBy,
      createdAt: divisionNotes.createdAt,
      authorName: users.name
    }).from(divisionNotes)
      .leftJoin(users, eq(divisionNotes.createdBy, users.id))
      .where(isNull(divisionNotes.divisionId))
      .orderBy(desc(divisionNotes.createdAt));

    const processedData = data.map(d => ({
      ...d,
      canDelete: user.realRole === 'super_admin' || user.role === 'SUPER_ADMIN' || user.role === 'KETUA' || d.createdBy === parseInt(user.id)
    }));
    
    return NextResponse.json(processedData);
  } catch (error) {
    console.error("GET ketua notes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    if (user.realRole !== 'super_admin' && user.role !== 'SUPER_ADMIN' && user.role !== 'KETUA') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content } = body;
    
    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan isi harus diisi" }, { status: 400 });
    }

    const [newNote] = await db.insert(divisionNotes).values({
      title,
      content,
      createdBy: parseInt(user.id),
      divisionId: null // Global / Ketua notes have no specific division
    }).returning();
    
    
    try {
      await logActivity({
        action: "CREATE",
        entityType: "KETUA_CATATAN",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(newNote, { status: 201 });
  } catch (error: any) {
    console.error("POST ketua notes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
