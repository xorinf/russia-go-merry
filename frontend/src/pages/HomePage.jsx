import React, { useState, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SearchBar from '../components/ui/SearchBar';
import SearchResults from '../components/ui/SearchResults';
import TrendingQueries from '../components/ui/TrendingQueries';
import CategoryGrid from '../components/ui/CategoryGrid';
import TopSolved from '../components/ui/TopSolved';
import TrendingIssues from '../components/ui/TrendingIssues';
import CTA from '../components/ui/CTA';
import api from '../utils/api';

/* Hand-drawn doodle decorations */
function DoodleElements() {
  return (
    <>
      {/* Curly bracket doodle */}
      <div className="absolute -top-6 -left-16 hidden lg:block" style={{ pointerEvents: 'none' }}>
        <svg width="50" height="100" viewBox="0 0 50 100" fill="none" style={{ opacity: 0.3 }}>
          <path d="M40 8 C26 8, 22 18, 22 28 C22 38, 16 44, 6 46 C16 48, 22 54, 22 64 C22 74, 26 84, 40 84" stroke="#b8a080" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        </svg>
      </div>

      {/* "Let's solve it!" speech bubble */}
      <div className="absolute -top-8 left-[40px] hidden lg:block" style={{ pointerEvents: 'none', transform: 'rotate(-6deg)' }}>
        <svg width="105" height="80" viewBox="0 0 105 80" fill="none" style={{ opacity: 0.32 }}>
          <ellipse cx="52" cy="28" rx="42" ry="22" stroke="#b8a080" strokeWidth="2" strokeDasharray="6 4" fill="none"/>
          <path d="M68 46 L80 68 L62 44" stroke="#b8a080" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <text x="22" y="25" fontSize="11" fontFamily="'DM Serif Display', serif" fontStyle="italic" fill="#8a7560" opacity="0.85">Let&apos;s</text>
          <text x="18" y="38" fontSize="11" fontFamily="'DM Serif Display', serif" fontStyle="italic" fill="#8a7560" opacity="0.85">solve it!</text>
        </svg>
      </div>

      {/* Big sparkle */}
      <div className="absolute top-2 right-[28%] hidden lg:block" style={{ pointerEvents: 'none' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ opacity: 0.35 }}>
          <path d="M14 2 L14 26 M2 14 L26 14 M5 5 L23 23 M23 5 L5 23" stroke="#c4943a" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Small star */}
      <div className="absolute top-[20px] left-[16%] hidden lg:block" style={{ pointerEvents: 'none' }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ opacity: 0.3 }}>
          <path d="M9 0 L9 18 M0 9 L18 9" stroke="#5a7a5a" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M3 3 L15 15 M15 3 L3 15" stroke="#5a7a5a" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Curved arrow */}
      <div className="absolute top-[120px] -left-10 hidden lg:block" style={{ pointerEvents: 'none' }}>
        <svg width="70" height="70" viewBox="0 0 70 70" fill="none" style={{ opacity: 0.3 }}>
          <path d="M12 8 C24 30, 36 44, 58 54" stroke="#b8a080" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <path d="M48 48 L58 54 L50 60" stroke="#b8a080" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Lightbulb doodle */}
      <div className="absolute -top-4 -right-14 hidden lg:block" style={{ pointerEvents: 'none' }}>
        <svg width="55" height="75" viewBox="0 0 55 75" fill="none" style={{ opacity: 0.3 }}>
          <path d="M27 12 C16 12, 10 20, 10 28 C10 36, 16 40, 20 46 L34 46 C38 40, 44 36, 44 28 C44 20, 38 12, 27 12Z" stroke="#c4943a" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <line x1="20" y1="50" x2="34" y2="50" stroke="#c4943a" strokeWidth="2" strokeLinecap="round"/>
          <line x1="22" y1="54" x2="32" y2="54" stroke="#c4943a" strokeWidth="2" strokeLinecap="round"/>
          <line x1="27" y1="2" x2="27" y2="7" stroke="#c4943a" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="8" y1="12" x2="12" y2="16" stroke="#c4943a" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="46" y1="12" x2="42" y2="16" stroke="#c4943a" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="2" y1="28" x2="7" y2="28" stroke="#c4943a" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="47" y1="28" x2="52" y2="28" stroke="#c4943a" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Question mark doodle */}
      <div className="absolute top-[210px] -right-14 hidden lg:block" style={{ pointerEvents: 'none' }}>
        <svg width="40" height="60" viewBox="0 0 40 60" fill="none" style={{ opacity: 0.35 }}>
          <path d="M12 16 C12 6, 28 6, 28 16 C28 24, 20 26, 20 36" stroke="#b8a080" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <circle cx="20" cy="44" r="2.5" fill="#b8a080"/>
        </svg>
      </div>

      {/* Pencil doodle */}
      <div className="absolute top-[200px] left-[-20px] hidden lg:block" style={{ pointerEvents: 'none' }}>
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" style={{ opacity: 0.28 }}>
          <path d="M38 5 L12 32 L10 42 L20 40 L46 13 Z" stroke="#8a7560" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="30" y1="12" x2="38" y2="20" stroke="#8a7560" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Code brackets */}
      <div className="absolute top-[330px] right-[-12px] hidden lg:block" style={{ pointerEvents: 'none' }}>
        <svg width="45" height="55" viewBox="0 0 45 55" fill="none" style={{ opacity: 0.28 }}>
          <path d="M16 5 L6 27 L16 49" stroke="#8a7560" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M29 5 L39 27 L29 49" stroke="#8a7560" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="14" y1="20" x2="31" y2="20" stroke="#8a7560" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="14" y1="34" x2="31" y2="34" stroke="#8a7560" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Wavy squiggle */}
      <div className="absolute top-[170px] right-[12%] hidden lg:block" style={{ pointerEvents: 'none' }}>
        <svg width="90" height="16" viewBox="0 0 90 16" fill="none" style={{ opacity: 0.3 }}>
          <path d="M2 8 Q12 2, 22 8 Q32 14, 42 8 Q52 2, 62 8 Q72 14, 82 8" stroke="#5a7a5a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
    </>
  );
}

export default function HomePage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchBarRef = useRef(null);

  const handleTrendingClick = async (query) => {
    setLoading(true);
    setResults(null);
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

  const isSearchActive = results || loading;

  return (
    <div className="min-h-screen bg-bg grid-bg">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8">
        
        {/* Hero heading */}
        <section className="relative text-center mb-8">
          <DoodleElements />

          <h1 className="font-serif text-[1.75rem] sm:text-4xl md:text-5xl lg:text-[3.2rem] leading-[1.15] tracking-tight text-ink mb-3">
            Ask. Discover. Get{' '}
            <span className="doodle-underline font-serif" style={{ fontWeight: 700 }}>Solved.</span>
            <svg className="inline-block ml-2 align-middle" width="24" height="18" viewBox="0 0 24 18" style={{ opacity: 0.18 }}>
              <path d="M2 12 Q6 4 12 9 Q18 14 22 6" stroke="#1f1f1f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
          </h1>

          <p className="text-sm sm:text-base text-ink-soft mb-6 sm:mb-8 max-w-lg leading-relaxed mx-auto px-2">
            Search your doubt or explore solved questions from the community.
          </p>
        </section>

        {/* Search + Categories Row */}
        {!isSearchActive ? (
          /* Default layout: Search + Popular Searches | Category Grid side by side */
          <section className="flex flex-col lg:flex-row items-stretch lg:items-start justify-center gap-5 sm:gap-8 mb-8 sm:mb-10 mx-auto" style={{ maxWidth: '980px' }}>
            <div className="w-full lg:flex-1 lg:max-w-[540px]">
              <SearchBar
                ref={searchBarRef}
                onResults={setResults}
                onLoading={setLoading}
              />
              <TrendingQueries onQueryClick={handleTrendingClick} />
            </div>
            <div className="w-full lg:w-[380px] lg:flex-shrink-0">
              <CategoryGrid />
            </div>
          </section>
        ) : (
          /* Search active: Full-width search bar + results below */
          <section className="max-w-2xl mx-auto mb-10">
            <SearchBar
              ref={searchBarRef}
              onResults={setResults}
              onLoading={setLoading}
            />
            {/* Back button to clear search */}
            <button
              onClick={() => { setResults(null); setLoading(false); }}
              className="mt-4 mb-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-soft hover:text-ink hover:bg-mist transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to Home
            </button>
            <SearchResults results={results} loading={loading} />
          </section>
        )}

        {/* Top Solved + Trending Issues Row */}
        {!isSearchActive && (
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 sm:gap-8 items-start">
            <TopSolved />
            <div className="lg:mt-14 mt-0">
              <TrendingIssues />
            </div>
          </section>
        )}

        {/* CTA */}
        {!isSearchActive && <CTA />}

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
