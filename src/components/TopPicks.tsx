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
    gradient: 'from-emerald-500/10 to-emerald-500/5',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    glow: 'shadow-emerald-500/5',
    label: 'BUY YES',
  },
  buy_no: {
    gradient: 'from-rose-500/10 to-rose-500/5',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    glow: 'shadow-rose-500/5',
    label: 'BUY NO',
  },
  skip: {
    gradient: 'from-zinc-500/10 to-zinc-500/5',
    border: 'border-zinc-500/30',
    badge: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    glow: 'shadow-zinc-500/5',
    label: 'SKIP',
  },
};

export default function TopPicks({ picks, onSelectPick, isScanning, scanProgress }: TopPicksProps) {
  const actionablePicks = picks.filter((p) => p.recommendation !== 'skip');

  // Scanning state
  if (isScanning) {
    const progressPercent = scanProgress ? (scanProgress.current / scanProgress.total) * 100 : 0;
    return (
      <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        <div className="relative">
          <div className="flex items-center mb-4">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-amber-500/30 blur-lg rounded-full animate-pulse" />
              <svg className="relative animate-spin h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">Scanning Markets</p>
              <p className="text-sm text-zinc-400">Analyzing with GPT-4o, Claude & Gemini</p>
            </div>
          </div>

          <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400/50 to-orange-400/50 rounded-full blur-sm transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">{scanProgress ? `${scanProgress.current} of ${scanProgress.total} markets` : 'Initializing...'}</span>
            <span className="text-amber-400">{scanProgress ? `~${Math.ceil((scanProgress.total - scanProgress.current) * 5 / 3)}s` : ''}</span>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (actionablePicks.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/5 via-transparent to-transparent" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 mb-4">
            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-zinc-400 mb-1">No opportunities found yet</p>
          <p className="text-sm text-zinc-500">
            Click <span className="text-amber-400 font-medium">Scan Top 10</span> to analyze markets
          </p>
        </div>
      </div>
    );
  }

  // Results
  return (
    <div className="grid gap-3">
      {actionablePicks.map((pick, index) => {
        const config = recommendationConfig[pick.recommendation];
        return (
          <div
            key={pick.market.ticker}
            onClick={() => onSelectPick(pick)}
            className={`group relative overflow-hidden rounded-xl border ${config.border} bg-gradient-to-r ${config.gradient} p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-xl ${config.glow}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-zinc-500">#{index + 1}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${config.badge}`}>
                    {config.label}
                  </span>
                </div>

                <h4 className="font-medium text-white truncate mb-1 group-hover:text-violet-300 transition-colors">
                  {pick.market.title}
                </h4>

                {pick.market.yes_sub_title && (
                  <p className="text-sm text-violet-400 truncate mb-2">
                    {pick.market.yes_sub_title}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">AI:</span>
                    <span className="font-medium text-white">{(pick.consensusProbability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">Market:</span>
                    <span className="font-medium text-zinc-400">{(pick.impliedProbability * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {Math.abs(pick.edgePercentage).toFixed(0)}%
                </div>
                <div className="text-xs text-zinc-500">edge</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
