import { auth } from "@/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || (session.user.realRole !== "super_admin" && session.user.realRole !== "admin_bendahara")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // get transaction for logging
    const tx = await db.select().from(transactions).where(eq(transactions.id, parseInt(id))).limit(1);

    if (tx.length > 0) {
      await db.delete(transactions).where(eq(transactions.id, parseInt(id)));
      
      try {
        await logActivity({
          action: "DELETE",
          entityType: "TRANSACTION",
          entityName: tx[0].description,
          divisionId: session?.user?.divisionId || null,
        });
      } catch(e) {}
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
