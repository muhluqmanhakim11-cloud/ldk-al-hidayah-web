import { auth } from "@/auth";
import { db } from "@/db";
import { announcementAcknowledgments } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const announcementId = parseInt(id);
    const userId = parseInt(session.user.id);
    
    const body = await req.json();
    const replyMessage = body.replyMessage || null;

    const [ack] = await db.insert(announcementAcknowledgments).values({
      announcementId,
      userId,
      isRead: true,
      replyMessage,
      repliedAt: replyMessage ? new Date() : null,
    }).onConflictDoUpdate({
      target: [announcementAcknowledgments.announcementId, announcementAcknowledgments.userId],
      set: {
        isRead: true,
        replyMessage: replyMessage || undefined,
        repliedAt: replyMessage ? new Date() : undefined
      }
    }).returning();

    return NextResponse.json(ack, { status: 200 });
  } catch (error) {
    console.error("Acknowledge Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
