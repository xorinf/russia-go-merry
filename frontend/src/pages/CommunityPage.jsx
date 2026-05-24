import React, { useEffect, useRef, useState, useCallback } from 'react';
import Navbar from '../components/layout/Navbar';
import CommunityPostCard from '../components/ui/CommunityPostCard';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const Avatar = ({ name, size = 'sm' }) => {
  const initials = (name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['bg-sage-100 text-sage-700', 'bg-amber-100 text-amber-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`${size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'} rounded-full ${color} flex-shrink-0 flex items-center justify-center font-semibold`}>
      {initials}
    </div>
  );
};

// ─── Post Detail Dialog ────────────────────────────────────────────────────
function PostDetailDialog({ post: initialPost, onClose, currentUserId, userRole }) {
  const dialogRef = useRef(null);
  const [post, setPost] = useState(initialPost);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [resolveText, setResolveText] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);

  const isAnswered = post.status === 'answered';
  const upvoteCount = post.upvotes?.length ?? 0;
  const hasUpvoted = post.upvotes?.some(
    (id) => (typeof id === 'object' ? id._id || id : id)?.toString() === currentUserId
  );
  const canResolve = userRole === 'admin' || userRole === 'moderator';

  // Open dialog & handle light-dismiss (following modern-web-guidance)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();

    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);

    // Fallback for browsers without closedby support
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (e) => {
        if (e.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isContent =
          rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
        if (!isContent) dialog.close();
      };
      dialog.addEventListener('click', handleBackdropClick);
      return () => {
        dialog.removeEventListener('close', handleClose);
        dialog.removeEventListener('click', handleBackdropClick);
      };
    }

    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const handleUpvote = async () => {
    if (upvoteLoading) return;
    setUpvoteLoading(true);
    try {
      const res = await api.post(`/community/${post._id}/upvote`);
      setPost((prev) => ({
        ...prev,
        upvotes: res.data.upvotedByMe
          ? [...(prev.upvotes || []), currentUserId]
          : (prev.upvotes || []).filter((u) => (typeof u === 'object' ? u._id : u)?.toString() !== currentUserId),
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setUpvoteLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || commentLoading) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`/community/${post._id}/comments`, { body: commentText });
      setPost((prev) => ({ ...prev, comments: [...(prev.comments || []), res.data.comment] }));
      setCommentText('');
    } catch (e) {
      console.error(e);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolveText.trim() || resolveLoading) return;
    setResolveLoading(true);
    try {
      await api.patch(`/community/${post._id}/resolve`, { answer: resolveText });
      setPost((prev) => ({ ...prev, status: 'answered', answer: resolveText.trim() }));
      setShowResolveForm(false);
      setResolveText('');
    } catch (e) {
      console.error(e);
    } finally {
      setResolveLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="post-dialog-title"
      className="m-auto w-full max-w-2xl rounded-2xl border border-black/8 shadow-2xl bg-white p-0 backdrop:bg-ink/30 backdrop:backdrop-blur-sm"
      style={{ maxHeight: '90vh' }}
    >
      <div className="flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-6 pb-4 border-b border-black/6">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5
              ${isAnswered ? 'bg-sage-50 text-sage-600' : 'bg-amber-50 text-amber-500'}`}>
              {isAnswered ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.5 9L7.5 13L14.5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.7"/>
                  <path d="M9 6V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                  <circle cx="9" cy="12.5" r="0.9" fill="currentColor"/>
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h2 id="post-dialog-title" className="text-base font-semibold text-ink leading-snug">
                {post.title}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                  ${isAnswered ? 'bg-sage-100 text-sage-800' : 'bg-amber-50 text-amber-700'}`}>
                  {isAnswered ? '✓ Answered' : '○ Open'}
                </span>
                <span className="text-xs text-ink/40">by {post.author?.name || 'Student'}</span>
                <span className="text-xs text-ink/30">·</span>
                <span className="text-xs text-ink/40">{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => dialogRef.current?.close()}
            aria-label="Close dialog"
            className="flex-shrink-0 w-8 h-8 rounded-full bg-mist flex items-center justify-center text-ink/50 hover:text-ink hover:bg-black/8 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">

          {/* Question body */}
          <div className="px-6 py-4">
            <p className="text-sm text-ink/70 leading-relaxed">{post.body}</p>
          </div>

          {/* Upvote row */}
          <div className="px-6 pb-4 flex items-center gap-3">
            <button
              onClick={handleUpvote}
              disabled={upvoteLoading}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                ${hasUpvoted
                  ? 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                  : 'bg-mist text-ink/60 hover:bg-black/8 hover:text-ink'
                } disabled:opacity-50`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill={hasUpvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                <path d="M7 1L8.8 4.8H13L9.8 7.6L11 12L7 9.2L3 12L4.2 7.6L1 4.8H5.2L7 1Z" strokeLinejoin="round"/>
              </svg>
              {hasUpvoted ? 'Upvoted' : 'Upvote'}
              <span className="font-semibold">{upvoteCount}</span>
            </button>
            <span className="text-xs text-ink/35 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 2.5C1 1.67 1.67 1 2.5 1h7C10.33 1 11 1.67 11 2.5v5C11 8.33 10.33 9 9.5 9H7L4.5 11V9H2.5C1.67 9 1 8.33 1 7.5v-5z" strokeLinejoin="round"/>
              </svg>
              {post.comments?.length ?? 0} comments
            </span>

            {/* Resolve button for admins */}
            {canResolve && !isAnswered && (
              <button
                onClick={() => setShowResolveForm((v) => !v)}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sage-600 text-white hover:bg-sage-700 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 6L5 9L10 3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Mark as Resolved
              </button>
            )}
          </div>

          {/* Official answer */}
          {isAnswered && post.answer && (
            <div className="mx-6 mb-4 rounded-xl bg-sage-50 border border-sage-200 p-4">
              <p className="text-xs font-semibold text-sage-700 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 0L7.5 4.5H12L8.5 7L9.8 11.5L6 8.5L2.2 11.5L3.5 7L0 4.5H4.5L6 0Z"/>
                </svg>
                Official Answer
              </p>
              <p className="text-sm text-ink/75 leading-relaxed">{post.answer}</p>
            </div>
          )}

          {/* Resolve form */}
          {showResolveForm && (
            <form onSubmit={handleResolve} className="mx-6 mb-4 rounded-xl border border-sage-200 bg-sage-50 p-4">
              <label className="block text-xs font-medium text-sage-700 mb-2">Write the official answer</label>
              <textarea
                value={resolveText}
                onChange={(e) => setResolveText(e.target.value)}
                rows={3}
                placeholder="Provide a clear, helpful answer…"
                className="w-full rounded-lg border border-sage-200 bg-white px-3 py-2 text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={resolveLoading || !resolveText.trim()}
                  className="px-4 py-1.5 rounded-lg bg-sage-600 text-white text-xs font-medium hover:bg-sage-700 transition-colors disabled:opacity-50"
                >
                  {resolveLoading ? 'Saving…' : 'Save Answer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResolveForm(false)}
                  className="px-4 py-1.5 rounded-lg bg-white text-ink/60 text-xs font-medium hover:bg-mist transition-colors border border-black/8"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Comments section */}
          <div className="px-6 pb-2">
            <h3 className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-3">
              Comments ({post.comments?.length ?? 0})
            </h3>

            {post.comments?.length === 0 ? (
              <p className="text-sm text-ink/35 py-2">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-3">
                {post.comments.map((c, i) => (
                  <div key={c._id || i} className="flex items-start gap-2.5">
                    <Avatar name={c.author?.name} size="sm" />
                    <div className="flex-1 bg-mist rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-ink">{c.author?.name || 'User'}</span>
                        <span className="text-xs text-ink/30">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-ink/75 leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add comment form */}
          <form onSubmit={handleComment} className="px-6 pt-3 pb-6">
            <div className="flex gap-2 items-start">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                placeholder="Write a comment…"
                className="flex-1 rounded-xl border border-black/10 bg-mist px-3 py-2.5 text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleComment(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="flex-shrink-0 mt-0.5 px-4 py-2.5 rounded-xl bg-sage-600 text-white text-sm font-medium hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentLoading ? '…' : 'Post'}
              </button>
            </div>
            <p className="text-xs text-ink/30 mt-1.5 ml-1">Press Enter to post, Shift+Enter for newline</p>
          </form>
        </div>
      </div>
    </dialog>
  );
}

// ─── Create Post Modal ─────────────────────────────────────────────────────
function CreatePostDialog({ onClose, onCreated }) {
  const dialogRef = useRef(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();

    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (e) => {
        if (e.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isContent =
          rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
        if (!isContent) dialog.close();
      };
      dialog.addEventListener('click', handleBackdropClick);
      return () => {
        dialog.removeEventListener('close', handleClose);
        dialog.removeEventListener('click', handleBackdropClick);
      };
    }
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !body.trim()) {
      setError('Both title and description are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/community', { title: title.trim(), body: body.trim() });
      onCreated(res.data.post);
      dialogRef.current?.close();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="create-post-title"
      className="m-auto w-full max-w-lg rounded-2xl border border-black/8 shadow-2xl bg-white p-0 backdrop:bg-ink/30 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 id="create-post-title" className="text-base font-semibold text-ink">Ask a Question</h2>
            <p className="text-xs text-ink/45 mt-0.5">Share your question with the community</p>
          </div>
          <button
            onClick={() => dialogRef.current?.close()}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-mist flex items-center justify-center text-ink/50 hover:text-ink hover:bg-black/8 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="post-title" className="block text-xs font-medium text-ink/70 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. How do I request leave during the internship?"
              maxLength={150}
              required
              className="w-full rounded-xl border border-black/10 bg-mist px-3 py-2.5 text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all"
            />
            <p className="text-xs text-ink/30 mt-1 text-right">{title.length}/150</p>
          </div>

          <div>
            <label htmlFor="post-body" className="block text-xs font-medium text-ink/70 mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="post-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Describe your question in detail. Include any context that might be helpful…"
              maxLength={2000}
              required
              className="w-full rounded-xl border border-black/10 bg-mist px-3 py-2.5 text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all resize-none"
            />
            <p className="text-xs text-ink/30 mt-1 text-right">{body.length}/2000</p>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading || !title.trim() || !body.trim()}
              className="flex-1 py-2.5 rounded-xl bg-sage-600 text-white text-sm font-medium hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting…' : 'Post Question'}
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="px-5 py-2.5 rounded-xl border border-black/10 text-ink/60 text-sm font-medium hover:bg-mist transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPosts = useCallback(() => {
    setLoading(true);
    api.get('/community')
      .then((res) => {
        setPosts(res.data.posts || []);
        setTotal(res.data.total || 0);
      })
      .catch(() => setError('Failed to load posts. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setTotal((t) => t + 1);
    setShowCreate(false);
  };

  const handleCloseDetail = () => {
    // Refresh the post in the list after interaction (upvotes, comments)
    setSelectedPost(null);
    fetchPosts();
  };

  // Filter + search + sort
  const visible = posts
    .filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.body?.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'popular') return (b.upvotes?.length ?? 0) - (a.upvotes?.length ?? 0);
      if (sort === 'discussed') return (b.comments?.length ?? 0) - (a.comments?.length ?? 0);
      return 0;
    });

  const answeredCount = posts.filter((p) => p.status === 'answered').length;
  const unansweredCount = posts.filter((p) => p.status === 'unanswered').length;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-ink tracking-tight">Community Board</h1>
            {!loading && (
              <p className="mt-1.5 text-sm text-ink/45">
                {total} discussions · {answeredCount} answered · {unansweredCount} open
              </p>
            )}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            id="ask-question-btn"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sage-600 text-white text-sm font-medium hover:bg-sage-700 active:bg-sage-800 transition-colors shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Ask a Question
          </button>
        </div>

        {/* Search */}
        {!loading && total > 0 && (
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-white text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-sage-400 transition-all"
            />
          </div>
        )}

        {/* Filter + Sort row */}
        {!loading && !error && total > 0 && (
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            {/* Filter tabs */}
            <div className="flex gap-1 p-1 bg-mist rounded-lg w-fit">
              {[
                { key: 'all', label: 'All' },
                { key: 'answered', label: 'Answered' },
                { key: 'unanswered', label: 'Open' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                    ${filter === key ? 'bg-white text-ink shadow-card' : 'text-ink/50 hover:text-ink'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-black/10 bg-white text-xs text-ink/70 focus:outline-none focus:ring-2 focus:ring-sage-400 cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="popular">Most upvoted</option>
              <option value="discussed">Most commented</option>
            </select>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-black/6 shadow-card p-4 flex items-start gap-4 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-mist flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-mist rounded w-3/4" />
                  <div className="h-3 bg-mist rounded w-1/2" />
                  <div className="h-3 bg-mist rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && total === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-mist flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" className="text-ink/30" strokeWidth="1.5">
                <circle cx="14" cy="14" r="11"/>
                <path d="M14 8.5V14.5" strokeLinecap="round"/>
                <circle cx="14" cy="18" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-ink/60">No discussions yet</p>
            <p className="text-xs text-ink/35 mt-1">Be the first to ask a question!</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-sage-600 text-white text-sm font-medium hover:bg-sage-700 transition-colors"
            >
              Ask a Question
            </button>
          </div>
        )}

        {/* No results from search/filter */}
        {!loading && !error && total > 0 && visible.length === 0 && (
          <p className="text-center text-sm text-ink/40 py-16">
            No posts match your current filters.
          </p>
        )}

        {/* Posts list */}
        {!loading && !error && visible.length > 0 && (
          <div className="space-y-3">
            {visible.map((post) => (
              <CommunityPostCard
                key={post._id}
                post={post}
                onClick={setSelectedPost}
                currentUserId={user?._id || user?.id}
              />
            ))}
          </div>
        )}

        <div className="h-12" />
      </main>

      {/* Post detail dialog */}
      {selectedPost && (
        <PostDetailDialog
          post={selectedPost}
          onClose={handleCloseDetail}
          currentUserId={user?._id || user?.id}
          userRole={user?.role}
        />
      )}

      {/* Create post dialog */}
      {showCreate && (
        <CreatePostDialog
          onClose={() => setShowCreate(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
}
