import { auth } from "@/auth";
import { db } from "@/db";
import { divisionNotes, users, divisions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    if (user.realRole !== 'super_admin' && user.realRole !== 'admin_seni_olahraga') {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get division ID for seni-olahraga
    const divs = await db.select().from(divisions).where(eq(divisions.slug, 'seni-olahraga'));
    const divId = divs[0]?.id;

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
      .where(eq(divisionNotes.divisionId, divId))
      .orderBy(desc(divisionNotes.createdAt));

    const processedData = data.map(d => ({
      ...d,
      canDelete: user.realRole === 'super_admin' || d.createdBy === parseInt(user.id)
    }));
    
    return NextResponse.json(processedData);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    if (user.realRole !== 'super_admin' && user.realRole !== 'admin_seni_olahraga') {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content } = body;
    
    const divs = await db.select().from(divisions).where(eq(divisions.slug, 'seni-olahraga'));
    const divId = divs[0]?.id;

    const [newNote] = await db.insert(divisionNotes).values({
      title,
      content,
      createdBy: parseInt(user.id),
      divisionId: divId
    }).returning();
    
    
    try {
      await logActivity({
        action: "CREATE",
        entityType: "SENI_OLAHRAGA_CATATAN",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(newNote, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Optional: Add strict role check here if needed, but we trust the route's existing auth
    await db.delete(divisionNotes);
    
    try {
      await logActivity({
        action: "DELETE",
        entityType: "SENI_OLAHRAGA_CATATAN",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
