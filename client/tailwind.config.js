/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#05050A', // Deep Obsidian Black
        accent: '#00D4C8',     // Electric Teal
        secondary: '#FF6B35',  // Ember Orange
        surface: '#12121A',    // Deep surface black/gray
        surfaceHover: '#1A1A24', 
        textPrimary: '#F0F0F5', // Off-white/slate
        textMuted: '#6B6B80',   // Subdued blue/gray
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='white' stroke-opacity='0.03' stroke-width='1'/%3E%3C/svg%3E\")",
      },
      animation: {
        'grid-scroll': 'grid-scroll 20s linear infinite',
      },
      keyframes: {
        'grid-scroll': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100px)' },
        }
      }
    },
  },
  plugins: [],
}
