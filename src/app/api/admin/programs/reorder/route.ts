import { auth } from "@/auth";
import { db } from "@/db";
import { programs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role === "KETUA") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Process updates concurrently
    await Promise.all(
      items.map((item: { id: number; orderIndex: number }) =>
        db.update(programs)
          .set({ orderIndex: item.orderIndex })
          .where(eq(programs.id, item.id))
      )
    );

    try {
      await logActivity({
        action: "UPDATE",
        entityType: "PROGRAMS",
        entityName: "Order",
        divisionId: session?.user?.divisionId || null,
      });
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
