import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Navigation configuration extracted for easy maintenance and scaling
const navItems = [
  { label: 'Home', to: '/' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Community Board', to: '/community' },
];

export default function Navbar() {
  // Access global auth state and logout functionality
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle user sign out and redirect to the login screen
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // Sticky header with a subtle glassmorphism background effect
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-black/6">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        
        {/* Brand Logo & Name - Always links back to the home page */}
        <NavLink to="/" className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-sage-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" opacity="0.9"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
            </svg>
          </span>
          <span className="font-semibold text-sm tracking-tight">Yaksha FAQ</span>
        </NavLink>

        {/* Desktop Navigation - Hidden on mobile screens (md:flex) */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'} // Ensures exact match for the home route
              // Dynamically apply active styling based on the current URL
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg text-sm transition-colors duration-150 ` +
                (isActive
                  ? 'bg-sage-50 text-sage-700 font-medium'
                  : 'text-ink/60 hover:text-ink hover:bg-mist')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          {/* Display user name only on larger screens */}
          <span className="hidden sm:block text-xs text-ink/50 font-medium">
            {user?.name}
          </span>
          <button 
            onClick={handleLogout} 
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-ink/70 hover:bg-mist hover:text-ink transition-colors duration-150 ease-in-out text-xs px-3 py-1.5"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile Navigation - Shown only on small screens (md:hidden) */}
      <div className="md:hidden border-t border-black/5 px-6 py-2 flex gap-1">
        {navItems.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-xs flex-1 text-center transition-colors duration-150 ` +
              (isActive
                ? 'bg-sage-50 text-sage-700 font-medium'
                : 'text-ink/60 hover:text-ink hover:bg-mist')
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
