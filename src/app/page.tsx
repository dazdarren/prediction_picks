'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import MarketCard from '@/components/MarketCard';
import AnalysisModal from '@/components/AnalysisModal';
import TopPicks from '@/components/TopPicks';
import { KalshiMarket, ConsensusAnalysis } from '@/types';

export default function Home() {
  const [markets, setMarkets] = useState<KalshiMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingTicker, setAnalyzingTicker] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ConsensusAnalysis | null>(null);
  const [topPicks, setTopPicks] = useState<ConsensusAnalysis[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/markets?limit=100');
      if (!response.ok) throw new Error('Failed to fetch markets');
      const data = await response.json();
      setMarkets(data.markets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMarkets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  const handleAnalyze = async (market: KalshiMarket) => {
    setAnalyzingTicker(market.ticker);
    try {
      const response = await fetch('/api/analyze', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setSelectedAnalysis(data.analysis);

      // Add to top picks if it has significant edge
      if (Math.abs(data.analysis.edgePercentage) > 3) {
        setTopPicks((prev) => {
          const filtered = prev.filter((p) => p.market.ticker !== market.ticker);
          const updated = [...filtered, data.analysis];
          return updated.sort((a, b) => b.mispricingScore - a.mispricingScore).slice(0, 10);
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Failed to analyze market. Please check your API keys.');
    } finally {
      setAnalyzingTicker(null);
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(markets.map((m) => m.category).filter(Boolean))];

  // Filter markets
  const filteredMarkets = markets.filter((market) => {
    const matchesFilter = filter === 'all' || market.category === filter;
    const matchesSearch =
      searchTerm === '' ||
      market.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (market.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header onRefresh={fetchMarkets} isLoading={isLoading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Picks Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Top Mispriced Picks
          </h2>
          <TopPicks picks={topPicks} onSelectPick={setSelectedAnalysis} />
        </section>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchMarkets}
              className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Markets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map((market) => (
                <MarketCard
                  key={market.ticker}
                  market={market}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={analyzingTicker === market.ticker}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredMarkets.length === 0 && !error && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  No markets found matching your criteria.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Analysis Modal */}
      <AnalysisModal
        analysis={selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
      />
    </div>
  );
}
