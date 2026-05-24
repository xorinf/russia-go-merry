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
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10)',
        'float': '0 8px 24px 0 rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
};
