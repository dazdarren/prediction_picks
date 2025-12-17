import { NextRequest, NextResponse } from 'next/server';
import { fetchEvents } from '@/lib/kalshi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch events with nested markets (events have proper categories)
    const events = await fetchEvents(limit);

    return NextResponse.json({
      events,
    });
  } catch (error) {
    console.error('Markets API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}
