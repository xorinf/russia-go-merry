/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0f0f0f',
          soft: '#1a1a2e',
        },
        sage: {
          50:  '#f4f7f4',
          100: '#e2ece2',
          200: '#c3d9c3',
          300: '#96bc96',
          400: '#649964',
          500: '#457a45',
          600: '#336133',
          700: '#294e29',
          800: '#223f22',
          900: '#1c341c',
        },
        cream: '#faf9f6',
        mist: '#f0eeea',
        admin: {
          bg: '#030307',
          surface: '#0d0d18',
          card: '#0f0f1e',
          purple: '#8b5cf6',
          'purple-bright': '#a78bfa',
          blue: '#3b82f6',
          cyan: '#22d3ee',
          green: '#10b981',
          yellow: '#f59e0b',
          red: '#ef4444',
          text: '#e4e4f0',
          muted: '#6b6b8a',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10)',
        'float': '0 8px 24px 0 rgba(0,0,0,0.10)',
        'glow-purple': '0 0 24px rgba(139,92,246,0.4)',
        'glow-blue': '0 0 24px rgba(59,130,246,0.4)',
        'glow-cyan': '0 0 24px rgba(34,211,238,0.4)',
        'admin-card': '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
};
