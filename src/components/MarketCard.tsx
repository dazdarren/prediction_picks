'use client';

import { KalshiMarket } from '@/types';

interface MarketCardProps {
  market: KalshiMarket;
  onAnalyze: (market: KalshiMarket) => void;
  isAnalyzing?: boolean;
}

export default function MarketCard({ market, onAnalyze, isAnalyzing }: MarketCardProps) {
  const impliedProb = ((market.yes_bid + market.yes_ask) / 2 * 100).toFixed(1);
  const closeDate = new Date(market.close_time).toLocaleDateString();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
          {market.category}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Closes: {closeDate}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
        {market.title}
      </h3>

      {market.yes_sub_title && (
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
          {market.yes_sub_title}
        </p>
      )}

      {market.subtitle && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {market.subtitle}
        </p>
      )}

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
        disabled={isAnalyzing}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {isAnalyzing ? (
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
