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
  const closeDate = market ? new Date(market.close_time).toLocaleDateString() : '';

  // For single market events, show simple yes/no
  if (isSingleMarket && market) {
    const impliedProb = ((market.yes_bid + market.yes_ask) / 2 * 100).toFixed(1);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
            {event.category}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Closes: {closeDate}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
          {event.title}
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">YES</div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {(market.yes_ask * 100).toFixed(0)}¢
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Bid: {(market.yes_bid * 100).toFixed(0)}¢
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded p-2">
            <div className="text-xs text-red-600 dark:text-red-400 font-medium">NO</div>
            <div className="text-lg font-bold text-red-700 dark:text-red-300">
              {(market.no_ask * 100).toFixed(0)}¢
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Bid: {(market.no_bid * 100).toFixed(0)}¢
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>Implied: {impliedProb}%</span>
          <span>Vol: {market.volume.toLocaleString()}</span>
        </div>

        <button
          onClick={() => onAnalyze(market)}
          disabled={analyzingTicker === market.ticker}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {analyzingTicker === market.ticker ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze with AI'
          )}
        </button>
      </div>
    );
  }

  // For multi-market events, show expandable card
  // Sort markets by yes_ask price (highest probability first)
  const sortedMarkets = [...event.markets].sort((a, b) => b.yes_ask - a.yes_ask);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
            {event.category}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {event.markets.length} outcomes
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
          {event.title}
        </h3>

        {/* Preview of top outcomes */}
        <div className="space-y-2 mb-3">
          {sortedMarkets.slice(0, 3).map((m) => (
            <div key={m.ticker} className="flex justify-between items-center text-sm">
              <span className="text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                {m.yes_sub_title || m.title}
              </span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {(m.yes_ask * 100).toFixed(0)}¢
              </span>
            </div>
          ))}
          {event.markets.length > 3 && !isExpanded && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              +{event.markets.length - 3} more outcomes
            </div>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium py-2 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors"
        >
          {isExpanded ? 'Collapse' : 'View All Outcomes'}
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded view with all outcomes */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedMarkets.map((m) => {
              const impliedProb = ((m.yes_bid + m.yes_ask) / 2 * 100).toFixed(1);
              return (
                <div
                  key={m.ticker}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {m.yes_sub_title || m.title}
                    </span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {(m.yes_ask * 100).toFixed(0)}¢
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>Implied: {impliedProb}%</span>
                    <span>Vol: {m.volume.toLocaleString()}</span>
                    <span>Bid: {(m.yes_bid * 100).toFixed(0)}¢</span>
                  </div>

                  <button
                    onClick={() => onAnalyze(m)}
                    disabled={analyzingTicker === m.ticker}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors"
                  >
                    {analyzingTicker === m.ticker ? 'Analyzing...' : 'Analyze'}
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
