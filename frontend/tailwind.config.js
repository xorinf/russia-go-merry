/** @type {import('tailwindcss').Config} */
export default {
  // 1. Content Array
  // Tells Tailwind exactly which files to scan for class names so it can purge unused CSS in production
  content: ['./index.html', './src/**/*.{js,jsx}'],
  
  theme: {
    // 2. Extend
    // We use "extend" instead of overwriting the base theme so we don't lose Tailwind's default colors/spacing
    extend: {
      
      // Custom Typography
      // Overrides the default sans/mono fonts to use the Google Fonts loaded in index.html
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      
      // Custom Color Palette
      colors: {
        ink: {
          DEFAULT: '#0f0f0f', // Primary dark text/element color
          soft: '#1a1a2e',    // Slightly softer dark variant
        },
        // A complete 10-step scale for your primary brand color (Sage Green)
        sage: {
          50:  '#f4f7f4',
          100: '#e2ece2',
          200: '#c3d9c3',
          300: '#96bc96',
          400: '#649964',
          500: '#457a45',
          600: '#336133', // Used for primary buttons
          700: '#294e29', // Used for button hover states
          800: '#223f22',
          900: '#1c341c',
        },
        cream: '#faf9f6', // Main background color
        mist: '#f0eeea',  // Subtle offset background (e.g., for inputs or inactive tabs)
      },
      
      // Custom Shadows
      // Abstracted shadow definitions to keep component classes clean (e.g., 'shadow-card' instead of complex arbitrary values)
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)', // Subtle default depth
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10)',                         // Elevated depth on mouse hover
        'float': '0 8px 24px 0 rgba(0,0,0,0.10)',                              // For modals, dropdowns, or floating icons
      },
    },
  },
  plugins: [],
};
