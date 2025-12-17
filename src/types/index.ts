// Kalshi Market Types
export interface KalshiMarket {
  ticker: string;
  title: string;
  subtitle?: string;
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
}

// AI Analysis Types
export interface AIAnalysis {
  provider: 'openai' | 'anthropic' | 'gemini';
  estimatedProbability: number;
  confidence: number;
  reasoning: string;
  keyFactors: string[];
  recommendation: 'buy_yes' | 'buy_no' | 'hold';
}

export interface ConsensusAnalysis {
  market: KalshiMarket;
  analyses: AIAnalysis[];
  consensusProbability: number;
  consensusConfidence: number;
  impliedProbability: number;
  edgePercentage: number;
  recommendation: 'strong_buy_yes' | 'buy_yes' | 'hold' | 'buy_no' | 'strong_buy_no';
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
