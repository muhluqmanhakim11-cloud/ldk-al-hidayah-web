import { auth } from "@/auth";
import { db } from "@/db";
import { divisionNotes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    if (user.realRole !== 'super_admin' && user.realRole !== 'admin_dkm') {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const noteId = parseInt(id);
    
    const [note] = await db.select().from(divisionNotes).where(eq(divisionNotes.id, noteId));
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (user.realRole !== 'super_admin' && note.createdBy !== parseInt(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(divisionNotes).where(eq(divisionNotes.id, noteId));
    
    try {
      await logActivity({
        action: "DELETE",
        entityType: "DKM_CATATAN",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
