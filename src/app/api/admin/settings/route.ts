import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET() {
  try {
    let settings = await db.query.siteSettings.findFirst();
    
    if (!settings) {
      // Create default settings if it doesn't exist
      const [newSettings] = await db.insert(siteSettings).values({}).returning();
      settings = newSettings;
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    // Only superadmin can edit settings
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    let settings = await db.query.siteSettings.findFirst();
    
    if (!settings) {
      const [newSettings] = await db.insert(siteSettings).values(body).returning();
      return NextResponse.json(newSettings);
    } else {
      const [updated] = await db.update(siteSettings)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, settings.id))
        .returning();
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error("Error updating site settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
