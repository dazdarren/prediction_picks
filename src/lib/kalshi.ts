import { KalshiMarket, KalshiEvent } from '@/types';

const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';

interface KalshiMarketsResponse {
  markets: KalshiMarketRaw[];
  cursor?: string;
}

interface KalshiMarketRaw {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle?: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  volume: number;
  volume_24h: number;
  open_interest: number;
  close_time: string;
  status: string;
  result?: string;
  rules_primary?: string;
  category?: string;
}

interface KalshiEventsResponse {
  events: KalshiEventRaw[];
  cursor?: string;
}

interface KalshiEventRaw {
  event_ticker: string;
  series_ticker: string;
  title: string;
  subtitle?: string;
  category: string;
  markets: KalshiMarketRaw[];
}

export async function fetchMarkets(
  limit: number = 50,
  cursor?: string,
  status: string = 'open'
): Promise<{ markets: KalshiMarket[]; cursor?: string }> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    status,
  });

  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await fetch(`${KALSHI_API_BASE}/markets?${params}`, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Kalshi API error: ${response.status}`);
  }

  const data: KalshiMarketsResponse = await response.json();

  const markets: KalshiMarket[] = data.markets.map((m) => ({
    ticker: m.ticker,
    title: m.title,
    subtitle: m.subtitle,
    category: m.category || 'Unknown',
    status: m.status,
    yes_bid: m.yes_bid / 100, // Convert cents to dollars
    yes_ask: m.yes_ask / 100,
    no_bid: m.no_bid / 100,
    no_ask: m.no_ask / 100,
    last_price: m.last_price / 100,
    volume: m.volume,
    volume_24h: m.volume_24h,
    open_interest: m.open_interest,
    close_time: m.close_time,
    result: m.result,
    rules_primary: m.rules_primary,
  }));

  return { markets, cursor: data.cursor };
}

export async function fetchEvents(
  limit: number = 20,
  status: string = 'open'
): Promise<KalshiEvent[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    status,
    with_nested_markets: 'true',
  });

  const response = await fetch(`${KALSHI_API_BASE}/events?${params}`, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Kalshi API error: ${response.status}`);
  }

  const data: KalshiEventsResponse = await response.json();

  return data.events.map((e) => ({
    event_ticker: e.event_ticker,
    series_ticker: e.series_ticker,
    title: e.title,
    subtitle: e.subtitle,
    category: e.category,
    markets: e.markets?.map((m) => ({
      ticker: m.ticker,
      title: m.title,
      subtitle: m.subtitle,
      category: e.category,
      status: m.status,
      yes_bid: m.yes_bid / 100,
      yes_ask: m.yes_ask / 100,
      no_bid: m.no_bid / 100,
      no_ask: m.no_ask / 100,
      last_price: m.last_price / 100,
      volume: m.volume,
      volume_24h: m.volume_24h,
      open_interest: m.open_interest,
      close_time: m.close_time,
      result: m.result,
      rules_primary: m.rules_primary,
    })) || [],
  }));
}

export async function fetchMarketByTicker(ticker: string): Promise<KalshiMarket | null> {
  const response = await fetch(`${KALSHI_API_BASE}/markets/${ticker}`, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Kalshi API error: ${response.status}`);
  }

  const data = await response.json();
  const m = data.market;

  return {
    ticker: m.ticker,
    title: m.title,
    subtitle: m.subtitle,
    category: m.category || 'Unknown',
    status: m.status,
    yes_bid: m.yes_bid / 100,
    yes_ask: m.yes_ask / 100,
    no_bid: m.no_bid / 100,
    no_ask: m.no_ask / 100,
    last_price: m.last_price / 100,
    volume: m.volume,
    volume_24h: m.volume_24h,
    open_interest: m.open_interest,
    close_time: m.close_time,
    result: m.result,
    rules_primary: m.rules_primary,
  };
}

// Calculate implied probability from market prices
export function calculateImpliedProbability(market: KalshiMarket): number {
  // Use midpoint of yes bid/ask as implied probability
  const midpoint = (market.yes_bid + market.yes_ask) / 2;
  return midpoint;
}

// Find markets with potential mispricing opportunities
export function filterHighVolumeMarkets(
  markets: KalshiMarket[],
  minVolume: number = 100
): KalshiMarket[] {
  return markets.filter((m) => m.volume >= minVolume && m.status === 'open');
}
