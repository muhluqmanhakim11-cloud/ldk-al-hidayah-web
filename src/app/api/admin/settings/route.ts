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
    
    const { 
      orgName, 
      description, 
      address, 
      email, 
      instagramUrl, 
      youtubeUrl, 
      tiktokUrl, 
      facebookUrl,
      vercelBadgeUrl,
      popupEnabled,
      popupImage,
      popupDuration
    } = body;

    // Build update object based on provided fields
    const updateData: any = { updatedAt: new Date() };
    
    if (orgName !== undefined) updateData.orgName = orgName;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (email !== undefined) updateData.email = email;
    if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl;
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;
    if (tiktokUrl !== undefined) updateData.tiktokUrl = tiktokUrl;
    if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl;
    if (vercelBadgeUrl !== undefined) updateData.vercelBadgeUrl = vercelBadgeUrl;
    if (popupEnabled !== undefined) updateData.popupEnabled = popupEnabled;
    if (popupImage !== undefined) updateData.popupImage = popupImage;
    if (popupDuration !== undefined) updateData.popupDuration = popupDuration;

    let settings = await db.query.siteSettings.findFirst();
    
    if (!settings) {
      const [newSettings] = await db.insert(siteSettings).values(body).returning();
      return NextResponse.json(newSettings);
    } else {
      const [updated] = await db.update(siteSettings)
        .set(updateData)
        .where(eq(siteSettings.id, settings.id))
        .returning();
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error("Error updating site settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
