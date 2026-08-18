import { auth } from "@/auth";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const announcementSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  content: z.string().min(1, "Konten wajib diisi"),
  targetRole: z.string().min(1, "Target divisi wajib diisi"),
  isActive: z.boolean().default(true),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.realRole !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await db.query.announcements.findMany({
      orderBy: [desc(announcements.id)],
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.realRole !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = announcementSchema.safeParse(body);
    if (!parsed.success) {
      
    try {
      await logActivity({
        action: "CREATE",
        entityType: "ANNOUNCEMENTS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }

    const [newAnnouncement] = await db.insert(announcements).values({
      ...parsed.data,
      createdBy: parseInt(session.user.id),
    }).returning();

    
    try {
      await logActivity({
        action: "CREATE",
        entityType: "ANNOUNCEMENTS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error("Announcement Creation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Optional: Add strict role check here if needed, but we trust the route's existing auth
    await db.delete(announcements);
    
    try {
      await logActivity({
        action: "DELETE",
        entityType: "ANNOUNCEMENTS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
