'use client';

import { ConsensusAnalysis } from '@/types';

interface AnalysisModalProps {
  analysis: ConsensusAnalysis | null;
  onClose: () => void;
}

const recommendationColors = {
  strong_buy_yes: 'bg-green-600',
  buy_yes: 'bg-green-500',
  hold: 'bg-gray-500',
  buy_no: 'bg-red-500',
  strong_buy_no: 'bg-red-600',
};

const recommendationLabels = {
  strong_buy_yes: 'Strong Buy YES',
  buy_yes: 'Buy YES',
  hold: 'Hold',
  buy_no: 'Buy NO',
  strong_buy_no: 'Strong Buy NO',
};

const providerLabels = {
  openai: 'GPT-4o',
  anthropic: 'Claude',
  gemini: 'Gemini',
};

export default function AnalysisModal({ analysis, onClose }: AnalysisModalProps) {
  if (!analysis) return null;

  const edgeColor = analysis.edgePercentage > 0 ? 'text-green-600' : analysis.edgePercentage < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Analysis Results
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {analysis.market.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Consensus Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                  AI Estimate
                </div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {(analysis.consensusProbability * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                  Market Price
                </div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {(analysis.impliedProbability * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                  Edge
                </div>
                <div className={`text-2xl font-bold ${edgeColor}`}>
                  {analysis.edgePercentage > 0 ? '+' : ''}{analysis.edgePercentage.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                  Confidence
                </div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {(analysis.consensusConfidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center">
              <span className={`${recommendationColors[analysis.recommendation]} text-white px-4 py-2 rounded-full font-semibold`}>
                {recommendationLabels[analysis.recommendation]}
              </span>
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                Mispricing Score: {analysis.mispricingScore.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Individual AI Analyses */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Individual AI Assessments
          </h3>
          <div className="space-y-4">
            {analysis.analyses.map((ai) => (
              <div
                key={ai.provider}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {providerLabels[ai.provider]}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Est: {(ai.estimatedProbability * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                      Conf: {(ai.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {ai.reasoning}
                </p>
                {ai.keyFactors.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {ai.keyFactors.map((factor, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
