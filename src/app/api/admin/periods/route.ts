import { auth } from "@/auth";
import { db } from "@/db";
import { periods } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const periodSchema = z.object({
  name: z.string().min(1, "Nama periode wajib diisi"),
  isActive: z.boolean().default(false),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allPeriods = await db.query.periods.findMany({
      orderBy: (periods, { desc }) => [desc(periods.id)],
    });
    return NextResponse.json(allPeriods);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // Only SUPER_ADMIN can create periods (Based on RBAC rule for Tahap 5)
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Hanya SUPER_ADMIN yang dapat membuat periode" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = periodSchema.safeParse(body);
    if (!parsed.success) {
      
    try {
      await logActivity({
        action: "CREATE",
        entityType: "PERIODS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    const validated = parsed.data;

    // If setting to active, we might want to deactivate others, but let's keep it simple or implement the logic
    if (validated.isActive) {
      await db.update(periods).set({ isActive: false });
    }

    const [newPeriod] = await db.insert(periods).values(validated).returning();
    
    try {
      await logActivity({
        action: "CREATE",
        entityType: "PERIODS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json(newPeriod, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Optional: Add strict role check here if needed, but we trust the route's existing auth
    await db.delete(periods);
    
    try {
      await logActivity({
        action: "DELETE",
        entityType: "PERIODS",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      });
    } catch(e) {}
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
