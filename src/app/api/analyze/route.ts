import { NextRequest, NextResponse } from 'next/server';
import { fetchMarketByTicker } from '@/lib/kalshi';
import { getConsensusAnalysis } from '@/lib/ai-analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticker } = body;

    if (!ticker) {
      return NextResponse.json(
        { error: 'Market ticker is required' },
        { status: 400 }
      );
    }

    // Fetch current market data
    const market = await fetchMarketByTicker(ticker);

    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    // Get consensus analysis from all AI providers
    const analysis = await getConsensusAnalysis(market);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze market' },
      { status: 500 }
    );
  }
}

// For analyzing market data passed directly (without fetching)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { market } = body;

    if (!market) {
      return NextResponse.json(
        { error: 'Market data is required' },
        { status: 400 }
      );
    }

    const analysis = await getConsensusAnalysis(market);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze market' },
      { status: 500 }
    );
  }
}
