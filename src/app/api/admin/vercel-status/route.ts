import { NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET() {
  try {
    const settings = await db.query.siteSettings.findFirst();
    if (!settings?.vercelBadgeUrl) {
      return NextResponse.json({ status: 'unknown' });
    }

    const res = await fetch(settings.vercelBadgeUrl, { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    const svg = await res.text();
    let status = 'unknown';
    
    if (svg.includes('passing') || svg.includes('ready')) {
      status = 'passing';
    } else if (svg.includes('building')) {
      status = 'building';
    } else if (svg.includes('failed') || svg.includes('failing')) {
      status = 'failed';
    }
    
    return NextResponse.json({ status });
  } catch (error) {
    return NextResponse.json({ status: 'unknown' });
  }
}
