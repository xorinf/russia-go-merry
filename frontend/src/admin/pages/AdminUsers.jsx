import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import adminApi from '../utils/adminApi';
import Badge from '../components/common/Badge';

function useDebounce(value, delay) {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN');
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const dSearch = useDebounce(search, 350);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (dSearch) params.set('search', dSearch);
    adminApi.get(`/admin/users?${params}`)
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, dSearch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [dSearch]);

  const cardStyle = { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' };
  const rowStyle = { borderColor: 'rgba(255,255,255,0.04)' };

  const roleColors = { admin: 'admin', moderator: 'moderator', user: 'user', ai_moderator: 'cyan' };

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white/90">User Activity</h2>
          <p className="text-xs text-white/30 mt-0.5">{total} registered users</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: total, color: '#8b5cf6' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#a78bfa' },
          { label: 'Moderators', value: users.filter(u => u.role === 'moderator').length, color: '#22d3ee' },
          { label: 'Regular Users', value: users.filter(u => u.role === 'user').length, color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-4" style={cardStyle}>
            <p className="text-2xl font-bold text-white tabular-nums">{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text" placeholder="Search users…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-lg text-sm text-white/80 placeholder-white/20 outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
      </div>

      {/* Users table */}
      <div className="rounded-xl border overflow-hidden" style={cardStyle}>
        <div className="grid grid-cols-[2fr_2fr_100px_110px_120px] gap-3 px-5 py-3 border-b text-[11px] font-semibold text-white/25 uppercase tracking-wider" style={rowStyle}>
          <span>Name</span><span>Email</span><span>Role</span><span>Joined</span><span>Last Updated</span>
        </div>

        {loading ? (
          <div className="py-6 space-y-2 px-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-white/[0.04]" />
                <div className="flex-1 h-4 rounded bg-white/[0.04]" />
                <div className="w-24 h-4 rounded bg-white/[0.04]" />
                <div className="w-16 h-5 rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-white/30">No users found</p>
          </div>
        ) : (
          users.map((u, i) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="grid grid-cols-[2fr_2fr_100px_110px_120px] gap-3 px-5 py-3.5 border-b items-center hover:bg-white/[0.02] transition-colors"
              style={rowStyle}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-white/70 truncate font-medium">{u.name}</span>
              </div>
              <span className="text-xs text-white/40 truncate">{u.email}</span>
              <div><Badge status={roleColors[u.role] || 'default'} label={u.role} /></div>
              <span className="text-xs text-white/30">{new Date(u.createdAt).toLocaleDateString('en-IN')}</span>
              <span className="text-xs text-white/25">{timeAgo(u.updatedAt)}</span>
            </motion.div>
          ))
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t text-xs text-white/30" style={rowStyle}>
            <span>Page {page} of {pages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 transition-colors">← Prev</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="px-3 py-1.5 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 transition-colors">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
