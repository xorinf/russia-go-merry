import React, { useState, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import SearchBar from '../components/ui/SearchBar';
import SearchResults from '../components/ui/SearchResults';
import TrendingQueries from '../components/ui/TrendingQueries';
import api from '../utils/api';

export default function HomePage() {
  // State to manage the active search results and UI loading status
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Reference to the search bar component (useful if you want to auto-focus it later)
  const searchBarRef = useRef(null);

  // Handler: Executes a search when a user clicks on a "Trending" suggestion chip
  const handleTrendingClick = async (query) => {
    // Reset UI state to prepare for new data
    setLoading(true);
    setResults(null);

    // UX enhancement: Smoothly scroll down so the user can focus on the upcoming results
    window.scrollTo({ top: 200, behavior: 'smooth' });

    try {
      // Trigger the hybrid AI search endpoint
      const res = await api.post('/search', { query });
      setResults(res.data.results);
    } catch {
      // Gracefully handle errors by showing an empty results state
      setResults([]);
    } finally {
      // Always remove the loading spinner, regardless of success or failure
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6">
        
        {/* Hero Section: Welcomes the user and establishes the page's purpose */}
        <div className="pt-16 pb-6 flex flex-col items-center text-center">
          
          {/* Decorative animated status pill */}
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

          {/* Core Search Component: Handles typing and form submission internally */}
          <SearchBar
            ref={searchBarRef}
            onResults={setResults}
            onLoading={setLoading}
          />
        </div>

        {/* Dynamic Content Area: 
            If searching (loading) or if we have results, show the SearchResults list. 
            Otherwise, fall back to showing the TrendingQueries default view. */}
        {results || loading ? (
          <SearchResults results={results} loading={loading} />
        ) : (
          <TrendingQueries onQueryClick={handleTrendingClick} />
        )}

        {/* Bottom padding to ensure content isn't cut off on smaller screens */}
        <div className="h-16" />
      </main>
    </div>
  );
}
