// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- OLD CONFIGS (PRESERVED FOR BACKWARD COMPATIBILITY) ---
        'brand-orange': '#F97316',
        'dark-bg': '#000000',
        'card-bg': '#1F1F1F',
        'footer-bg': '#111111',

        // --- NEW, STRUCTURED DESIGN SYSTEM ---
        // Primary Brand Color (can be used as `bg-brand` or `bg-brand-orange`)
        brand: {
          orange: '#F97316',
          DEFAULT: '#F97316',
          light: '#FB923C',
          dark: '#EA580C',
        },
        // Neutral Palette for UI
        ui: {
          background: '#F8F9FA', // A slightly off-white for the main background
          surface: '#FFFFFF',    // For cards and pop-ups
          border: '#E9ECEF',    // Subtle borders
          header: '#FFFFFF',
        },
        // Text Palette
        text: {
          primary: '#212529',   // Near-black for main text
          secondary: '#6C757D', // Gray for subtext
          muted: '#ADB5BD',     // Lighter gray for placeholders
          accent: '#4C5FD5',    // A premium blue for links/accents
        },
        // Gradient Colors for Tier Card
        premium: {
            start: '#4338CA', // A deeper indigo
            end: '#6D28D9'    // A richer purple
        }
      },
      boxShadow: {
        // Softer, more modern shadows
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        // --- OLD CONFIG (PRESERVED) ---
        '4xl': '2rem',
        
        // --- NEW CONFIG (MERGED) ---
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        // You can add a premium font like Inter if you haven't already
        sans: ['Inter', 'sans-serif'],
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'width': 'width',
      },
    },
  },
  plugins: [],
}
export default config;