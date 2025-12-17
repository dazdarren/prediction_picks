'use client';

import { useState } from 'react';
import { KalshiEvent, KalshiMarket } from '@/types';

interface EventCardProps {
  event: KalshiEvent;
  onAnalyze: (market: KalshiMarket) => void;
  analyzingTicker: string | null;
}

export default function EventCard({ event, onAnalyze, analyzingTicker }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isSingleMarket = event.markets.length === 1;
  const market = event.markets[0];
  const closeDate = market ? new Date(market.close_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  // Single market card
  if (isSingleMarket && market) {
    const impliedProb = ((market.yes_bid + market.yes_ask) / 2 * 100).toFixed(0);

    return (
      <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
              {event.category}
            </span>
            <span className="text-xs text-zinc-500">
              {closeDate}
            </span>
          </div>

          <h3 className="font-medium text-white mb-4 line-clamp-2 leading-snug">
            {event.title}
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
              <div className="text-xs text-emerald-400 font-medium mb-1">YES</div>
              <div className="text-xl font-bold text-white">
                {(market.yes_ask * 100).toFixed(0)}¢
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Bid {(market.yes_bid * 100).toFixed(0)}¢
              </div>
            </div>
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3">
              <div className="text-xs text-rose-400 font-medium mb-1">NO</div>
              <div className="text-xl font-bold text-white">
                {(market.no_ask * 100).toFixed(0)}¢
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Bid {(market.no_bid * 100).toFixed(0)}¢
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm text-zinc-500 mb-4">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {impliedProb}%
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {market.volume.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => onAnalyze(market)}
            disabled={analyzingTicker === market.ticker}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
          >
            {analyzingTicker === market.ticker ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Analyze with AI
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Multi-market expandable card
  const sortedMarkets = [...event.markets].sort((a, b) => b.yes_ask - a.yes_ask);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all duration-200">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
            {event.category}
          </span>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md">
            {event.markets.length} outcomes
          </span>
        </div>

        <h3 className="font-medium text-white mb-4 line-clamp-2 leading-snug">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4">
          {sortedMarkets.slice(0, 3).map((m) => (
            <div key={m.ticker} className="flex justify-between items-center py-1.5 border-b border-zinc-800/50 last:border-0">
              <span className="text-sm text-zinc-300 truncate flex-1 mr-3">
                {m.yes_sub_title || m.title}
              </span>
              <span className="text-sm font-semibold text-white tabular-nums">
                {(m.yes_ask * 100).toFixed(0)}¢
              </span>
            </div>
          ))}
          {event.markets.length > 3 && !isExpanded && (
            <div className="text-xs text-zinc-500 pt-1">
              +{event.markets.length - 3} more
            </div>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-sm text-zinc-300 hover:text-white font-medium py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-all duration-200"
        >
          {isExpanded ? 'Collapse' : 'View All Outcomes'}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded outcomes */}
      {isExpanded && (
        <div className="border-t border-zinc-800 bg-zinc-950/50 p-4">
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {sortedMarkets.map((m) => {
              const impliedProb = ((m.yes_bid + m.yes_ask) / 2 * 100).toFixed(0);
              return (
                <div
                  key={m.ticker}
                  className="rounded-lg bg-zinc-900 border border-zinc-800 p-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-white text-sm">
                      {m.yes_sub_title || m.title}
                    </span>
                    <span className="text-lg font-bold text-violet-400 tabular-nums">
                      {(m.yes_ask * 100).toFixed(0)}¢
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                    <span>{impliedProb}% implied</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>{m.volume.toLocaleString()} vol</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>Bid {(m.yes_bid * 100).toFixed(0)}¢</span>
                  </div>

                  <button
                    onClick={() => onAnalyze(m)}
                    disabled={analyzingTicker === m.ticker}
                    className="w-full flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white text-sm font-medium py-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    {analyzingTicker === m.ticker ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      'Analyze'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
