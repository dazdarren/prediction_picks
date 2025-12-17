'use client';

import { ConsensusAnalysis } from '@/types';

interface TopPicksProps {
  picks: ConsensusAnalysis[];
  onSelectPick: (pick: ConsensusAnalysis) => void;
}

const recommendationColors = {
  strong_buy_yes: 'border-green-500 bg-green-50 dark:bg-green-900/20',
  buy_yes: 'border-green-400 bg-green-50/50 dark:bg-green-900/10',
  hold: 'border-gray-400 bg-gray-50 dark:bg-gray-700/50',
  buy_no: 'border-red-400 bg-red-50/50 dark:bg-red-900/10',
  strong_buy_no: 'border-red-500 bg-red-50 dark:bg-red-900/20',
};

const recommendationLabels = {
  strong_buy_yes: 'STRONG YES',
  buy_yes: 'YES',
  hold: 'HOLD',
  buy_no: 'NO',
  strong_buy_no: 'STRONG NO',
};

export default function TopPicks({ picks, onSelectPick }: TopPicksProps) {
  if (picks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          No picks yet. Analyze markets to find mispriced opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {picks.map((pick, index) => (
        <div
          key={pick.market.ticker}
          onClick={() => onSelectPick(pick)}
          className={`border-l-4 ${recommendationColors[pick.recommendation]} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <span className="text-lg font-bold text-gray-800 dark:text-gray-200 mr-2">
                #{index + 1}
              </span>
              <span className="text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                Score: {pick.mispricingScore.toFixed(1)}
              </span>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              pick.recommendation.includes('yes')
                ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                : pick.recommendation.includes('no')
                ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
            }`}>
              {recommendationLabels[pick.recommendation]}
            </span>
          </div>

          <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
            {pick.market.title}
          </h4>

          <div className="flex justify-between text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">AI: </span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {(pick.consensusProbability * 100).toFixed(0)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Market: </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {(pick.impliedProbability * 100).toFixed(0)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Edge: </span>
              <span className={`font-medium ${pick.edgePercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pick.edgePercentage > 0 ? '+' : ''}{pick.edgePercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
