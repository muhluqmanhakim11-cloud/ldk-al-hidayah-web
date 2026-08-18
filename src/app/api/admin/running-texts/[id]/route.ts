import { auth } from "@/auth";
import { db } from "@/db";
import { runningTexts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const runningTextSchema = z.object({
  text: z.string().min(1, "Teks wajib diisi"),
  isActive: z.boolean().default(true),
  orderIndex: z.coerce.number().default(0),
});

export async function PATCH(req: Request, { params }: any) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KETUA")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const parsed = runningTextSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const [updated] = await db.update(runningTexts)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(runningTexts.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Running Text tidak ditemukan" }, { status: 404 });
    }

    
    try {
      await logActivity({
        action: "UPDATE",
        entityType: "RUNNING_TEXTS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KETUA")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const [deleted] = await db.delete(runningTexts).where(eq(runningTexts.id, id)).returning();
    if (!deleted) {
      return NextResponse.json({ error: "Running Text tidak ditemukan" }, { status: 404 });
    }

    
    try {
      await logActivity({
        action: "DELETE",
        entityType: "RUNNING_TEXTS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
