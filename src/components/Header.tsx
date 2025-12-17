'use client';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  onScan: () => void;
  isScanning: boolean;
  scanProgress?: { current: number; total: number };
}

export default function Header({ onRefresh, isLoading, onScan, isScanning, scanProgress }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-violet-500 to-purple-600 p-2 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight">
                Prediction Picks
              </h1>
              <p className="text-xs text-zinc-500">
                AI-powered market analysis
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* AI Status Indicators */}
            <div className="hidden sm:flex items-center space-x-3 mr-2">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-zinc-400">GPT-4o</span>
              </div>
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-xs text-zinc-400">Claude</span>
              </div>
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-xs text-zinc-400">Gemini</span>
              </div>
            </div>

            {/* Scan Button */}
            <button
              onClick={onScan}
              disabled={isScanning || isLoading}
              className="group relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
            >
              <span className="flex items-center">
                {isScanning ? (
                  <>
                    <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {scanProgress ? `${scanProgress.current}/${scanProgress.total}` : 'Scanning...'}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Scan Top 10
                  </>
                )}
              </span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading || isScanning}
              className="group px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-600"
            >
              <span className="flex items-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1.5 transition-transform group-hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
