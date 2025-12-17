import { KalshiMarket, KalshiEvent } from '@/types';
import crypto from 'crypto';

// Kalshi API - elections API is now the main API
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
  yes_sub_title?: string;
  no_sub_title?: string;
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

// Check if Kalshi API credentials are configured
function hasKalshiCredentials(): boolean {
  const hasKey = !!(process.env.KALSHI_API_KEY_ID && process.env.KALSHI_PRIVATE_KEY);
  if (hasKey) {
    const pk = process.env.KALSHI_PRIVATE_KEY!;
    console.log('Kalshi key check - has BEGIN:', pk.includes('BEGIN'), 'length:', pk.length);
  }
  return hasKey;
}


// Sign a request for Kalshi API authentication
function signRequest(method: string, path: string, timestamp: number): string {
  const privateKey = process.env.KALSHI_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('KALSHI_PRIVATE_KEY not configured');
  }

  // Message to sign: timestamp + method + path (without query params)
  // Path should include /trade-api/v2 prefix
  const pathWithoutQuery = path.split('?')[0];
  const message = `${timestamp}${method.toUpperCase()}${pathWithoutQuery}`;

  // Use RSA-PSS with SHA-256, matching Kalshi's Python example
  const signature = crypto.sign(
    'sha256',
    Buffer.from(message, 'utf-8'),
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    }
  );

  return signature.toString('base64');
}

// Create headers for authenticated requests
function getAuthHeaders(method: string, path: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (hasKalshiCredentials()) {
    const timestamp = Date.now();
    const signature = signRequest(method, path, timestamp);

    headers['KALSHI-ACCESS-KEY'] = process.env.KALSHI_API_KEY_ID!;
    headers['KALSHI-ACCESS-TIMESTAMP'] = timestamp.toString();
    headers['KALSHI-ACCESS-SIGNATURE'] = signature;
  }

  return headers;
}

// Fetch wrapper with optional authentication
async function kalshiFetch(path: string, method: string = 'GET'): Promise<Response> {
  const fullPath = `/trade-api/v2${path}`;
  const url = `${KALSHI_API_BASE}${path}`;
  const headers = getAuthHeaders(method, fullPath);

  const response = await fetch(url, {
    method,
    headers,
    next: { revalidate: 60 },
  });

  return response;
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

  const response = await kalshiFetch(`/markets?${params}`);

  if (!response.ok) {
    throw new Error(`Kalshi API error: ${response.status}`);
  }

  const data: KalshiMarketsResponse = await response.json();

  const markets: KalshiMarket[] = data.markets.map((m) => ({
    ticker: m.ticker,
    title: m.title,
    subtitle: m.subtitle,
    yes_sub_title: m.yes_sub_title,
    no_sub_title: m.no_sub_title,
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

  const response = await kalshiFetch(`/events?${params}`);

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
      yes_sub_title: m.yes_sub_title,
      no_sub_title: m.no_sub_title,
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
  const response = await kalshiFetch(`/markets/${ticker}`);

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
    yes_sub_title: m.yes_sub_title,
    no_sub_title: m.no_sub_title,
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

// Check if using authenticated API
export function isAuthenticated(): boolean {
  return hasKalshiCredentials();
}
