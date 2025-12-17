// Kalshi Market Types
export interface KalshiMarket {
  ticker: string;
  title: string;
  subtitle?: string;
  yes_sub_title?: string;
  no_sub_title?: string;
  category: string;
  status: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  volume: number;
  volume_24h: number;
  open_interest: number;
  close_time: string;
  result?: string;
  rules_primary?: string;
}

export interface KalshiEvent {
  event_ticker: string;
  series_ticker: string;
  title: string;
  subtitle?: string;
  category: string;
  markets: KalshiMarket[];
  close_time?: string;
}

// For API responses that return events
export interface EventsResponse {
  events: KalshiEvent[];
}

// AI Analysis Types
export interface AIAnalysis {
  provider: 'openai' | 'anthropic' | 'gemini';
  estimatedProbability: number;
  confidence: number;
  reasoning: string;
  recommendation: 'buy_yes' | 'buy_no' | 'skip';
}

export interface ConsensusAnalysis {
  market: KalshiMarket;
  analyses: AIAnalysis[];
  consensusProbability: number;
  consensusConfidence: number;
  impliedProbability: number;
  edgePercentage: number;
  recommendation: 'buy_yes' | 'buy_no' | 'skip';
  mispricingScore: number;
}

// API Response Types
export interface MarketsResponse {
  markets: KalshiMarket[];
  cursor?: string;
}

export interface AnalyzeResponse {
  analysis: ConsensusAnalysis;
  error?: string;
}
