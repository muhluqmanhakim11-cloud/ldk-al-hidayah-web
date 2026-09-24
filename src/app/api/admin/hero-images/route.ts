import { NextResponse } from 'next/server';
import { db } from '@/db';
import { heroImages } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db.query.heroImages.findMany({
      orderBy: [desc(heroImages.createdAt)],
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hero images' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl, title, subtitle, isActive, orderIndex } = body;
    const [newImg] = await db.insert(heroImages).values({
      imageUrl,
      title,
      subtitle,
      isActive: isActive ?? true,
      orderIndex: orderIndex ?? 0,
    }).returning();
    return NextResponse.json(newImg);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create hero image' }, { status: 500 });
  }
}
