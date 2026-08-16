import { auth } from "@/auth";
import { db } from "@/db";
import { announcements, announcementAcknowledgments } from "@/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const role = session.user.realRole; // e.g., 'admin_dkm'

    // Super admin does not receive these popups
    if (role === "super_admin") {
      return NextResponse.json(null);
    }

    // We want to find active announcements where targetRole is 'ALL' or matches the user's role
    // AND there is NO record in announcementAcknowledgments for this user and this announcement.
    
    // Drizzle doesn't have a simple NOT IN subquery without raw sql easily in query builder, 
    // so we can use a left join and filter where acknowledgment is null.
    
    const unread = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        targetRole: announcements.targetRole,
        createdAt: announcements.createdAt
      })
      .from(announcements)
      .leftJoin(
        announcementAcknowledgments,
        and(
          eq(announcements.id, announcementAcknowledgments.announcementId),
          eq(announcementAcknowledgments.userId, userId)
        )
      )
      .where(
        and(
          eq(announcements.isActive, true),
          // Either target is ALL or matches role
          // Using raw sql for OR might be needed, or we can just fetch all valid targets and filter
          // Let's use drizzle's or
          // Wait, drizzle-orm has 'or'
          // We can't import 'or' if we didn't import it. We need to import 'or' from drizzle-orm.
          isNull(announcementAcknowledgments.id)
        )
      )
      .orderBy(desc(announcements.createdAt));

    // Filter in memory for role because Drizzle OR is sometimes tricky to import if not added to the top
    const filtered = unread.filter(a => a.targetRole === 'ALL' || a.targetRole === role);

    if (filtered.length > 0) {
      // Return the most recent unread announcement
      return NextResponse.json(filtered[0]);
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error("Unread Announcement Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
