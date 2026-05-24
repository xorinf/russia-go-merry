import React, { useState, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import SearchBar from '../components/ui/SearchBar';
import SearchResults from '../components/ui/SearchResults';
import TrendingQueries from '../components/ui/TrendingQueries';
import api from '../utils/api';

export default function HomePage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchBarRef = useRef(null);

  // Handle clicking a trending query chip
  const handleTrendingClick = async (query) => {
    setLoading(true);
    setResults(null);

    // Scroll to results area smoothly
    window.scrollTo({ top: 200, behavior: 'smooth' });

    try {
      const res = await api.post('/search', { query });
      setResults(res.data.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6">
        {/* Hero section */}
        <div className="pt-16 pb-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-50 border border-sage-100 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-pulse" />
            <span className="text-xs text-sage-700 font-medium">Internship Knowledge Base</span>
          </div>

          <h1 className="text-3xl font-semibold text-ink tracking-tight mb-2">
            Find answers, fast.
          </h1>
          <p className="text-sm text-ink/50 mb-8 max-w-md">
            Search across FAQs and community discussions to find answers to your internship questions.
          </p>

          <SearchBar
            ref={searchBarRef}
            onResults={setResults}
            onLoading={setLoading}
          />
        </div>

        {/* Results or Trending */}
        {results || loading ? (
          <SearchResults results={results} loading={loading} />
        ) : (
          <TrendingQueries onQueryClick={handleTrendingClick} />
        )}

        {/* Footer spacer */}
        <div className="h-16" />
      </main>
    </div>
  );
}
