import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.realRole !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Prevent deleting the currently logged-in super admin (self)
    if (session.user.id === id) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun Anda sendiri yang sedang login" }, { status: 400 });
    }

    await db.delete(users).where(eq(users.id, parseInt(id)));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
