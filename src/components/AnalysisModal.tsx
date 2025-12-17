'use client';

import { ConsensusAnalysis } from '@/types';

interface AnalysisModalProps {
  analysis: ConsensusAnalysis | null;
  onClose: () => void;
}

const recommendationConfig = {
  buy_yes: {
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    label: 'BUY YES',
  },
  buy_no: {
    gradient: 'from-rose-500 to-rose-600',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    label: 'BUY NO',
  },
  skip: {
    gradient: 'from-zinc-500 to-zinc-600',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    text: 'text-zinc-400',
    label: 'SKIP',
  },
};

const providerConfig = {
  openai: { label: 'GPT-4o', color: 'bg-emerald-500' },
  anthropic: { label: 'Claude', color: 'bg-orange-500' },
  gemini: { label: 'Gemini', color: 'bg-blue-500' },
};

export default function AnalysisModal({ analysis, onClose }: AnalysisModalProps) {
  if (!analysis) return null;

  const config = recommendationConfig[analysis.recommendation];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="relative bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />

        <div className="p-6 overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 pr-4">
              <h2 className="text-lg font-semibold text-white leading-snug">
                {analysis.market.title}
              </h2>
              {analysis.market.yes_sub_title && (
                <p className="text-sm text-violet-400 mt-1">
                  {analysis.market.yes_sub_title}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Recommendation Card */}
          <div className={`relative overflow-hidden rounded-xl ${config.bg} border ${config.border} p-6 mb-6`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative text-center">
              <div className={`text-3xl font-bold ${config.text} mb-2`}>
                {config.label}
              </div>
              <div className="text-sm text-zinc-400 mb-3">
                AI consensus vs market price
              </div>
              <div className="flex justify-center gap-8">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {(analysis.consensusProbability * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-zinc-500">AI Estimate</div>
                </div>
                <div className="w-px bg-zinc-700" />
                <div>
                  <div className="text-2xl font-bold text-zinc-400">
                    {(analysis.impliedProbability * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-zinc-500">Market Price</div>
                </div>
              </div>
              {analysis.recommendation !== 'skip' && (
                <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} border ${config.border}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className={`text-sm font-medium ${config.text}`}>
                    {Math.abs(analysis.edgePercentage).toFixed(0)}% edge
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              AI Reasoning
            </h3>
            <div className="space-y-3">
              {analysis.analyses.map((ai) => {
                const provider = providerConfig[ai.provider];
                const recConfig = recommendationConfig[ai.recommendation];
                return (
                  <div
                    key={ai.provider}
                    className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${provider.color}`} />
                        <span className="font-medium text-white text-sm">
                          {provider.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${recConfig.bg} ${recConfig.text} border ${recConfig.border}`}>
                          {recConfig.label}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {(ai.estimatedProbability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {ai.reasoning}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
