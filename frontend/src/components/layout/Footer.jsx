import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-bg/50 backdrop-blur-[10px] py-6 mt-12 relative z-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-ink-faint">
          &copy; {currentYear} Missiles FAQ Portal. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link
            to="/admin"
            className="px-4 py-2 text-xs font-semibold text-ink border border-ink/15 rounded-full hover:bg-ink hover:text-white hover:border-ink transition-all cursor-pointer shadow-subtle"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
