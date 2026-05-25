import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

/* SVG icons */
function ThumbUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  );
}
function CommentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function BookmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function ConfidenceBadge({ post }) {
  // Determine confidence based on upvotes + answer status
  const isAnswered = post.status === 'answered';
  const upvotes = post.upvotes?.length || 0;
  
  let level = 'Medium';
  if (isAnswered && upvotes >= 5) level = 'High';
  else if (isAnswered || upvotes >= 3) level = 'High';
  
  const isHigh = level === 'High';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
      isHigh ? 'bg-success-light text-success' : 'bg-warning-light text-warning'
    }`}>
      {level} Confidence
    </span>
  );
}

export default function TopSolved() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/community')
      .then((res) => {
        // Get top posts sorted by upvote count, take top 4
        const allPosts = res.data.posts || res.data || [];
        const sorted = [...allPosts]
          .sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0))
          .slice(0, 4);
        setPosts(sorted);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mt-14">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-5 w-5 bg-mist rounded animate-pulse" />
          <div className="h-5 w-40 bg-mist rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse">
              <div className="h-4 bg-mist rounded w-3/4 mb-2" />
              <div className="h-3 bg-mist rounded w-full mb-4" />
              <div className="h-6 bg-mist rounded w-28 mb-4" />
              <div className="h-px bg-border mb-3" />
              <div className="flex gap-3">
                <div className="h-3 bg-mist rounded w-12" />
                <div className="h-3 bg-mist rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!posts.length) return null;

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f1f1f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
          <h2 className="font-serif text-xl text-ink">Top Solved Today</h2>
        </div>
        <button
          onClick={() => navigate('/community')}
          className="flex items-center gap-1 text-sm text-ink-soft hover:text-accent transition-colors cursor-pointer"
        >
          View all
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {posts.map((post) => (
          <article
            key={post._id}
            onClick={() => navigate('/community')}
            className="card-hover bg-card rounded-2xl border border-border p-5 cursor-pointer group"
          >
            <h3 className="font-semibold text-sm mb-1.5 group-hover:text-accent transition-colors leading-snug line-clamp-2">
              {post.title}
            </h3>
            <p className="text-xs text-ink-soft mb-4 leading-relaxed line-clamp-2">
              {post.body || 'Click to view details'}
            </p>
            <ConfidenceBadge post={post} />
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center gap-3 text-xs text-ink-soft">
                <span className="flex items-center gap-1">
                  <ThumbUpIcon /> {post.upvotes?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                  <CommentIcon /> {post.comments?.length || 0}
                </span>
              </div>
              <span className="text-ink-faint group-hover:text-accent transition-colors">
                <BookmarkIcon />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
