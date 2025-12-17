'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import AnalysisModal from '@/components/AnalysisModal';
import TopPicks from '@/components/TopPicks';
import { KalshiEvent, KalshiMarket, ConsensusAnalysis } from '@/types';

type SortOption = 'volume' | 'ending_soon' | 'trending' | 'newest';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'volume', label: 'Most Popular' },
  { value: 'trending', label: 'Trending (24h)' },
  { value: 'ending_soon', label: 'Ending Soon' },
  { value: 'newest', label: 'Newest' },
];

export default function Home() {
  const [events, setEvents] = useState<KalshiEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingTicker, setAnalyzingTicker] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ConsensusAnalysis | null>(null);
  const [topPicks, setTopPicks] = useState<ConsensusAnalysis[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('volume');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number } | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load first batch quickly for immediate display
      const firstBatch = await fetch('/api/markets?limit=50');
      if (!firstBatch.ok) throw new Error('Failed to fetch events');
      const firstData = await firstBatch.json();
      setEvents(firstData.events || []);
      setIsLoading(false);

      // Fetch remaining events in background
      setIsLoadingMore(true);
      const allEvents = await fetch('/api/markets');
      if (allEvents.ok) {
        const allData = await allEvents.json();
        setEvents(allData.events || []);
      }
      setIsLoadingMore(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setEvents([]);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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

  const handleScan = async () => {
    // Get top 10 markets by volume from all events
    const allMarkets = events
      .flatMap((e) => e.markets)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    if (allMarkets.length === 0) {
      alert('No markets to scan. Please refresh first.');
      return;
    }

    setIsScanning(true);
    setScanProgress({ current: 0, total: allMarkets.length });

    const newPicks: ConsensusAnalysis[] = [];
    const batchSize = 3; // Analyze 3 markets in parallel

    for (let i = 0; i < allMarkets.length; i += batchSize) {
      const batch = allMarkets.slice(i, i + batchSize);
      setScanProgress({ current: Math.min(i + batchSize, allMarkets.length), total: allMarkets.length });

      const batchResults = await Promise.all(
        batch.map(async (market) => {
          try {
            const response = await fetch('/api/analyze', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ market }),
            });

            if (response.ok) {
              const data = await response.json();
              return data.analysis;
            }
          } catch (err) {
            console.error(`Failed to analyze ${market.ticker}:`, err);
          }
          return null;
        })
      );

      // Add picks with significant edge
      batchResults.forEach((analysis) => {
        if (analysis && Math.abs(analysis.edgePercentage) > 3) {
          newPicks.push(analysis);
        }
      });

      // Update top picks incrementally so user sees results as they come in
      if (newPicks.length > 0) {
        setTopPicks((prev) => {
          const existingTickers = new Set(newPicks.map((p) => p.market.ticker));
          const filtered = prev.filter((p) => !existingTickers.has(p.market.ticker));
          const combined = [...filtered, ...newPicks];
          return combined.sort((a, b) => b.mispricingScore - a.mispricingScore).slice(0, 10);
        });
      }
    }

    setIsScanning(false);
    setScanProgress(undefined);
    setAnalyzingTicker(null);
  };

  // Get unique categories
  const categories = ['all', ...new Set(events.map((e) => e.category).filter(Boolean))];

  // Helper to get event metrics (from first/primary market)
  const getEventMetrics = (event: KalshiEvent) => {
    const totalVolume = event.markets.reduce((sum, m) => sum + m.volume, 0);
    const totalVolume24h = event.markets.reduce((sum, m) => sum + m.volume_24h, 0);
    const earliestClose = event.markets.reduce((earliest, m) => {
      const closeTime = new Date(m.close_time).getTime();
      return closeTime < earliest ? closeTime : earliest;
    }, Infinity);
    return { totalVolume, totalVolume24h, earliestClose };
  };

  // Filter and sort events
  const filteredEvents = events
    .filter((event) => {
      const matchesFilter = filter === 'all' || event.category === filter;
      const matchesSearch =
        searchTerm === '' ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.markets.some((m) =>
          m.yes_sub_title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const metricsA = getEventMetrics(a);
      const metricsB = getEventMetrics(b);

      switch (sortBy) {
        case 'volume':
          return metricsB.totalVolume - metricsA.totalVolume;
        case 'trending':
          return metricsB.totalVolume24h - metricsA.totalVolume24h;
        case 'ending_soon':
          return metricsA.earliestClose - metricsB.earliestClose;
        case 'newest':
          return metricsB.earliestClose - metricsA.earliestClose;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header
        onRefresh={fetchEvents}
        isLoading={isLoading}
        onScan={handleScan}
        isScanning={isScanning}
        scanProgress={scanProgress}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Picks Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Top Mispriced Picks
          </h2>
          <TopPicks
            picks={topPicks}
            onSelectPick={setSelectedAnalysis}
            isScanning={isScanning}
            scanProgress={scanProgress}
          />
        </section>

        {/* Filters & Sort */}
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
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span>{filteredEvents.length} markets found</span>
            {isLoadingMore && (
              <span className="flex items-center text-indigo-500">
                <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading more...
              </span>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchEvents}
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
            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.event_ticker}
                  event={event}
                  onAnalyze={handleAnalyze}
                  analyzingTicker={analyzingTicker}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredEvents.length === 0 && !error && (
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
