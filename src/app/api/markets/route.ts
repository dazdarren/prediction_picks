import { NextRequest, NextResponse } from 'next/server';
import { fetchMarkets, filterHighVolumeMarkets } from '@/lib/kalshi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor') || undefined;
    const minVolume = parseInt(searchParams.get('minVolume') || '0');

    const { markets, cursor: nextCursor } = await fetchMarkets(limit, cursor);

    // Filter by volume if specified
    const filteredMarkets = minVolume > 0
      ? filterHighVolumeMarkets(markets, minVolume)
      : markets;

    return NextResponse.json({
      markets: filteredMarkets,
      cursor: nextCursor,
    });
  } catch (error) {
    console.error('Markets API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}
