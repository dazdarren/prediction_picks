'use client';

import { ConsensusAnalysis } from '@/types';

interface AnalysisModalProps {
  analysis: ConsensusAnalysis | null;
  onClose: () => void;
}

const recommendationConfig = {
  buy_yes: {
    color: 'bg-green-500',
    label: 'BUY YES',
    icon: '↑',
  },
  buy_no: {
    color: 'bg-red-500',
    label: 'BUY NO',
    icon: '↓',
  },
  skip: {
    color: 'bg-gray-500',
    label: 'SKIP',
    icon: '→',
  },
};

const providerLabels = {
  openai: 'GPT-4o',
  anthropic: 'Claude',
  gemini: 'Gemini',
};

export default function AnalysisModal({ analysis, onClose }: AnalysisModalProps) {
  if (!analysis) return null;

  const config = recommendationConfig[analysis.recommendation];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                {analysis.market.title}
              </h2>
              {analysis.market.yes_sub_title && (
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                  {analysis.market.yes_sub_title}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Big Recommendation */}
          <div className={`${config.color} text-white rounded-lg p-6 mb-6 text-center`}>
            <div className="text-4xl font-bold mb-2">
              {config.icon} {config.label}
            </div>
            <div className="text-lg opacity-90">
              AI: {(analysis.consensusProbability * 100).toFixed(0)}% vs Market: {(analysis.impliedProbability * 100).toFixed(0)}%
            </div>
            {analysis.recommendation !== 'skip' && (
              <div className="text-sm mt-2 opacity-80">
                {Math.abs(analysis.edgePercentage).toFixed(0)}% edge detected
              </div>
            )}
          </div>

          {/* AI Opinions */}
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
            AI Reasoning
          </h3>
          <div className="space-y-3">
            {analysis.analyses.map((ai) => {
              const recConfig = recommendationConfig[ai.recommendation];
              return (
                <div
                  key={ai.provider}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {providerLabels[ai.provider]}
                    </span>
                    <span className={`${recConfig.color} text-white text-xs px-2 py-1 rounded font-medium`}>
                      {recConfig.label} ({(ai.estimatedProbability * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {ai.reasoning}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Close Button */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-3 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
