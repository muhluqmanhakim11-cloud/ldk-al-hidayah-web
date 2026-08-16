import { auth } from "@/auth";
import { db } from "@/db";
import { divisionNotes } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    const { id } = await params;
    const noteId = parseInt(id);
    
    // Get the note to check permissions
    const [note] = await db.select().from(divisionNotes).where(eq(divisionNotes.id, noteId));
    if (!note) return NextResponse.json({ error: "Catatan tidak ditemukan" }, { status: 404 });

    // Super admin / KETUA can delete any note. Others can only delete their own note.
    if (user.realRole !== 'super_admin' && user.role !== 'SUPER_ADMIN' && user.role !== 'KETUA' && note.createdBy !== parseInt(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(divisionNotes).where(eq(divisionNotes.id, noteId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE ketua notes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
