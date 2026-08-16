import { auth } from "@/auth";
import { db } from "@/db";
import { announcementAcknowledgments, users, divisions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.realRole !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const announcementId = parseInt(id);

    // Join with users and divisions to get meaningful names
    const data = await db
      .select({
        id: announcementAcknowledgments.id,
        isRead: announcementAcknowledgments.isRead,
        replyMessage: announcementAcknowledgments.replyMessage,
        repliedAt: announcementAcknowledgments.repliedAt,
        createdAt: announcementAcknowledgments.createdAt,
        user: {
          id: users.id,
          name: users.name,
          role: users.role,
        },
        division: {
          name: divisions.name,
        }
      })
      .from(announcementAcknowledgments)
      .innerJoin(users, eq(announcementAcknowledgments.userId, users.id))
      .leftJoin(divisions, eq(users.divisionId, divisions.id))
      .where(eq(announcementAcknowledgments.announcementId, announcementId))
      .orderBy(desc(announcementAcknowledgments.createdAt));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Acknowledgments Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
