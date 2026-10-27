/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Geospatial Intelligence Light Theme Palette
        geo: {
          bg: '#F5F7FB',         // Main background
          card: '#FFFFFF',       // Card background
          primary: '#234A72',    // Primary deep navy
          'primary-hover': '#1B3B5C',
          secondary: '#3F7898',  // Secondary slate blue
          teal: '#368A83',       // Teal accent
          'teal-hover': '#2C736D',
          'blue-light': '#EAF2F9',// Light blue panel
          'mint-light': '#E8F5F0',// Light mint panel
          'text-main': '#1D2939', // Main dark text
          'text-sub': '#667085',  // Secondary text
          'text-muted': '#98A2B3',// Muted text
          border: '#E1E7EF',     // Border lines
          'border-focus': '#B9CBE0',
        },
        // Retain compatibility space and cyber aliases mapped to the new palette
        space: {
          950: '#F5F7FB',
          900: '#FFFFFF',
          850: '#F0F4FA',
          800: '#EAF2F9',
          700: '#E1E7EF',
          600: '#CAD6E4',
        },
        cyber: {
          cyan: '#368A83',
          blue: '#234A72',
          teal: '#368A83',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#ef4444',
          purple: '#6366f1',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'geo-sm': '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
        'geo': '0 1px 3px 0 rgba(16, 24, 40, 0.1), 0 1px 2px -1px rgba(16, 24, 40, 0.1)',
        'geo-md': '0 4px 8px -2px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.04)',
        'geo-lg': '0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)',
        'geo-xl': '0 20px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 8px -4px rgba(16, 24, 40, 0.03)',
        'teal-glow': '0 0 15px rgba(54, 138, 131, 0.25)',
        'primary-glow': '0 0 15px rgba(35, 74, 114, 0.25)',
      }
    },
  },
  plugins: [],
}
