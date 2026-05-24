import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SourceBadge = ({ source }) =>
  source === 'faq' ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">FAQ</span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">Community</span>
  );

const ResultCard = ({ result }) => {
  const [expanded, setExpanded] = useState(false);
  const bodyRef = useRef(null);

  const title = result.question || result.title;
  const fullContent = result.answer || result.body;
  const hasContent = !!fullContent;
  const isAnswered = result.status === 'answered';
  const isCommunity = result.source === 'community';

  return (
    <div
      className={`bg-white rounded-xl border shadow-card transition-all duration-200 overflow-hidden
        ${expanded ? 'border-sage-200 shadow-card-hover' : 'border-black/6 hover:border-sage-100 hover:shadow-card-hover'}`}
    >
      {/* Clickable header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-4 flex items-start justify-between gap-3 group"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <p className="text-sm font-medium text-ink leading-snug group-hover:text-sage-700 transition-colors">
              {title}
            </p>
          </div>

          {/* Preview when collapsed */}
          {!expanded && hasContent && (
            <p className="mt-1.5 text-xs text-ink/50 leading-relaxed line-clamp-2">
              {fullContent}
            </p>
          )}

          {/* Metadata row */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <SourceBadge source={result.source} />
            {result.status && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                ${isAnswered ? 'bg-sage-100 text-sage-800' : 'bg-amber-50 text-amber-700'}`}>
                {isAnswered ? '✓ Answered' : '○ Open'}
              </span>
            )}
            {result.category && (
              <span className="text-xs text-ink/35">{result.category}</span>
            )}
          </div>
        </div>

        {/* Expand/collapse chevron */}
        <span className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200
          ${expanded ? 'bg-sage-100 text-sage-600 rotate-180' : 'bg-mist text-ink/40 group-hover:text-ink/70'}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-black/5">
          {/* FAQ answer */}
          {result.source === 'faq' && fullContent && (
            <div className="mt-3 rounded-xl bg-sage-50 border border-sage-100 p-4">
              <p className="text-xs font-semibold text-sage-700 mb-2 uppercase tracking-wide">Answer</p>
              <p className="text-sm text-ink/75 leading-relaxed whitespace-pre-wrap">{fullContent}</p>
            </div>
          )}

          {/* Community post body */}
          {isCommunity && result.body && (
            <div className="mt-3">
              <p className="text-sm text-ink/70 leading-relaxed">{result.body}</p>
            </div>
          )}

          {/* Community official answer */}
          {isCommunity && result.answer && (
            <div className="mt-3 rounded-xl bg-sage-50 border border-sage-100 p-4">
              <p className="text-xs font-semibold text-sage-700 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M5 0L6.2 3.5H10L7 5.5L8 9L5 7L2 9L3 5.5L0 3.5H3.8L5 0Z"/>
                </svg>
                Official Answer
              </p>
              <p className="text-sm text-ink/75 leading-relaxed">{result.answer}</p>
            </div>
          )}

          {/* Community post: unanswered prompt */}
          {isCommunity && !result.answer && (
            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 p-3">
              <p className="text-xs text-amber-700">
                This question hasn't been answered yet. Head to the Community Board to help!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CommunityBoardCard = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/community')}
      className="bg-white rounded-xl border border-black/6 shadow-card p-4 flex items-center justify-between group
                 hover:shadow-card-hover hover:border-sage-200 transition-all duration-150 w-full text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sage-50 flex items-center justify-center text-sage-600">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 3h12v8H9l-3 2v-2H2V3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Go to Community Board</p>
          <p className="text-xs text-ink/50">Ask the community your question</p>
        </div>
      </div>
      <span className="text-ink/30 group-hover:text-sage-600 transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </button>
  );
};

export default function SearchResults({ results, loading }) {
  if (loading) {
    return (
      <div className="mt-6 w-full max-w-2xl mx-auto space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-black/6 shadow-card p-4 animate-pulse">
            <div className="h-3.5 bg-mist rounded w-3/4 mb-2" />
            <div className="h-3 bg-mist rounded w-full mb-1" />
            <div className="h-3 bg-mist rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!results) return null;

  if (results.length === 0) {
    return (
      <div className="mt-6 w-full max-w-2xl mx-auto">
        <p className="text-center text-sm text-ink/50 mb-3">
          No matches found. Try asking the community:
        </p>
        <CommunityBoardCard />
      </div>
    );
  }

  return (
    <div className="mt-6 w-full max-w-2xl mx-auto space-y-3">
      <p className="text-xs text-ink/40 font-medium uppercase tracking-wide">
        Top results — click to expand
      </p>
      {results.map((result, idx) => (
        <ResultCard key={result._id || idx} result={result} />
      ))}
      {/* Always show Community Board card */}
      <CommunityBoardCard />
    </div>
  );
}
