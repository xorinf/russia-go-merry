import React, { useState, useRef, forwardRef } from 'react';
import api from '../../utils/api';

const SearchBar = forwardRef(function SearchBar({ onResults, onLoading, value, onQueryChange }, ref) {
  const [internalQuery, setInternalQuery] = useState('');
  const isControlled = value !== undefined;
  const query = isControlled ? value ?? '' : internalQuery;
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
    if (isControlled) {
      if (onQueryChange) {
        onQueryChange(value);
      }
    } else {
      setInternalQuery(value);
    }

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
      <div className="relative search-glow rounded-2xl transition-all duration-300">
        {/* Search icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 13L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <input
          ref={ref}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Ask anything about your internship…"
          className="w-full pl-12 pr-28 py-4 rounded-2xl border border-border bg-card text-sm text-ink placeholder-ink-faint focus:outline-none transition-all duration-300 shadow-subtle"
        />

        {/* Search button */}
        <button
          type="submit"
          disabled={!query.trim()}
          style={{ backgroundColor: '#5a7a5a' }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-medium hover:brightness-90 active:brightness-75 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-80">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Search
        </button>
      </div>
    </form>
  );
});

export default SearchBar;
