import { NextResponse } from 'next/server';
import { db } from '@/db';
import { heroImages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    const body = await req.json();
    const { imageUrl, title, subtitle, isActive, orderIndex } = body;
    
    const [updated] = await db.update(heroImages)
      .set({ imageUrl, title, subtitle, isActive, orderIndex, updatedAt: new Date() })
      .where(eq(heroImages.id, id))
      .returning();
      
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update hero image' }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    await db.delete(heroImages).where(eq(heroImages.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete hero image' }, { status: 500 });
  }
}
