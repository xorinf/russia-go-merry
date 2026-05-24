import React, { useState, useRef } from 'react';
import api from '../../utils/api';

export default function SearchBar({ onResults, onLoading }) {
  const [query, setQuery] = useState('');
  const debounceRef = useRef(null);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      onResults(null);
      return;
    }

    onLoading(true);
    try {
      const res = await api.post('/search', {
        query: searchQuery.trim(),
      });
      onResults(res.data.results);
    } catch (error) {
      console.error('Search failed:', error);
      onResults([]);
    } finally {
      onLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(debounceRef.current);
    if (value.trim().length >= 3) {
      debounceRef.current = setTimeout(() => handleSearch(value), 600);
    } else {
      onResults(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    handleSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 13L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Ask anything about your internship…"
          className="w-full pl-11 pr-28 py-3.5 rounded-xl border border-black/10 bg-white text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-sage-400/40 focus:border-sage-400 transition duration-150 disabled:opacity-60 shadow-card"
        />

        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-sage-600 text-white text-sm font-medium hover:bg-sage-700 active:bg-sage-800 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed py-1.5 px-4 text-xs disabled:opacity-40"
        >
          Search
        </button>
      </div>
    </form>
  );
}
