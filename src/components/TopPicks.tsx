'use client';

import { ConsensusAnalysis } from '@/types';

interface TopPicksProps {
  picks: ConsensusAnalysis[];
  onSelectPick: (pick: ConsensusAnalysis) => void;
  isScanning?: boolean;
  scanProgress?: { current: number; total: number };
}

const recommendationConfig = {
  buy_yes: {
    border: 'border-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    badge: 'bg-green-500 text-white',
    label: 'BUY YES',
  },
  buy_no: {
    border: 'border-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    badge: 'bg-red-500 text-white',
    label: 'BUY NO',
  },
  skip: {
    border: 'border-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-700/50',
    badge: 'bg-gray-500 text-white',
    label: 'SKIP',
  },
};

export default function TopPicks({ picks, onSelectPick, isScanning, scanProgress }: TopPicksProps) {
  // Only show actionable picks (not skips)
  const actionablePicks = picks.filter((p) => p.recommendation !== 'skip');

  // Show scanning progress banner
  if (isScanning) {
    const progressPercent = scanProgress ? (scanProgress.current / scanProgress.total) * 100 : 0;
    return (
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center justify-center mb-4">
          <svg className="animate-spin h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div>
            <p className="font-bold text-lg">Scanning Markets...</p>
            <p className="text-sm opacity-90">Analyzing with 3 AI models (GPT-4o-mini, Claude, Gemini)</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/30 rounded-full h-3 mb-2">
          <div
            className="bg-white h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-sm">
          <span>{scanProgress ? `${scanProgress.current} of ${scanProgress.total} markets` : 'Starting...'}</span>
          <span>~{scanProgress ? Math.ceil((scanProgress.total - scanProgress.current) * 5 / 3) : 15}s remaining</span>
        </div>
      </div>
    );
  }

  if (actionablePicks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          No mispriced markets found yet. Click <span className="font-semibold text-orange-500">"Scan Top 10"</span> to auto-analyze the highest volume markets.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actionablePicks.map((pick, index) => {
        const config = recommendationConfig[pick.recommendation];
        return (
          <div
            key={pick.market.ticker}
            onClick={() => onSelectPick(pick)}
            className={`border-l-4 ${config.border} ${config.bg} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  #{index + 1}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${config.badge}`}>
                  {config.label}
                </span>
              </div>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {Math.abs(pick.edgePercentage).toFixed(0)}% edge
              </span>
            </div>

            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1 mb-1">
              {pick.market.title}
            </h4>

            {pick.market.yes_sub_title && (
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">
                {pick.market.yes_sub_title}
              </p>
            )}

            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">AI: </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {(pick.consensusProbability * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Market: </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {(pick.impliedProbability * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
