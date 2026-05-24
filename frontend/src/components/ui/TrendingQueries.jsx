import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function TrendingQueries({ onQueryClick }) {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/search/trending')
      .then((res) => setTrending(res.data.trending || []))
      .catch(() => setTrending([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mt-10 w-full max-w-2xl mx-auto">
        <div className="h-3.5 bg-mist rounded w-32 mb-3 animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-28 bg-mist rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!trending.length) return null;

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto">
      <p className="text-xs font-medium text-ink/40 uppercase tracking-wide mb-3">
        Trending topics
      </p>
      <div className="flex flex-wrap gap-2">
        {trending.map((item) => (
          <button
            key={item.query}
            onClick={() => onQueryClick(item.query)}
            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full
                       bg-white border border-black/8 shadow-card
                       hover:border-sage-300 hover:bg-sage-50
                       transition-all duration-150"
          >
            <span className="text-xs font-medium text-ink/70 group-hover:text-sage-700 capitalize">
              {item.query}
            </span>
            <span className="text-[10px] font-mono text-ink/30 group-hover:text-sage-500">
              {item.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
