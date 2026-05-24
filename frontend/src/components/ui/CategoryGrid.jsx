import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  {
    name: 'React',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#61dafb" strokeWidth="1.3">
        <circle cx="12" cy="12" r="2.2"/>
        <ellipse cx="12" cy="12" rx="10" ry="4.5" strokeWidth="1.3"/>
        <ellipse cx="12" cy="12" rx="10" ry="4.5" strokeWidth="1.3" transform="rotate(60 12 12)"/>
        <ellipse cx="12" cy="12" rx="10" ry="4.5" strokeWidth="1.3" transform="rotate(120 12 12)"/>
      </svg>
    ),
  },
  {
    name: 'Backend',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="5" rx="1"/>
        <rect x="2" y="10" width="20" height="5" rx="1"/>
        <rect x="2" y="17" width="20" height="5" rx="1"/>
        <circle cx="6" cy="5.5" r="1" fill="#6b6b6b"/>
        <circle cx="6" cy="12.5" r="1" fill="#6b6b6b"/>
        <circle cx="6" cy="19.5" r="1" fill="#6b6b6b"/>
      </svg>
    ),
  },
  {
    name: 'GitHub',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
      </svg>
    ),
  },
  {
    name: 'MongoDB',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C12 2 8 6 8 12c0 4.5 2.5 8 4 10 1.5-2 4-5.5 4-10 0-6-4-10-4-10z" stroke="#47a248" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="22" x2="12" y2="18" stroke="#47a248" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'Setup',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    name: 'Npm / Node',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="1" stroke="#6b6b6b" strokeWidth="1.5"/>
        <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#6b6b6b" fontFamily="monospace">npm</text>
      </svg>
    ),
  },
  {
    name: 'Deployment',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
        <path d="M12 12v9"/>
        <path d="m8 17 4-4 4 4"/>
      </svg>
    ),
  },
  {
    name: 'Others',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
];

export default function CategoryGrid() {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-subtle">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2z"/>
          <path d="M5 15l.54 1.63L7 17.17l-1.46.37L5 19.17l-.54-1.63L3 17.17l1.46-.37L5 15z"/>
          <path d="M19 11l.54 1.63L21 13.17l-1.46.37L19 15.17l-.54-1.63L17 13.17l1.46-.37L19 11z"/>
        </svg>
        <h3 className="font-serif text-lg text-ink">
          Explore Categories
        </h3>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 categories-scroll md:grid">
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => navigate('/faq')}
            className="flex flex-col items-center gap-2.5 p-3 rounded-xl border border-transparent hover:border-border hover:bg-bg transition-all duration-200 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bg border border-border/50 group-hover:scale-105 transition-transform duration-200">
              {cat.icon}
            </div>
            <span className="text-xs font-medium text-ink-soft group-hover:text-ink transition-colors">
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      {/* Browse all */}
      <button
        onClick={() => navigate('/faq')}
        className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-ink-soft hover:text-accent transition-colors cursor-pointer py-1"
      >
        Browse all categories
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  );
}
