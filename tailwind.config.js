/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        verum: {
          navy: '#020617', // Deep Navy
          slate: '#1e293b', // Slate for borders/cards
          gold: '#c5a059', // Muted Metallic Gold
          'gold-hover': '#d4af37',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'], // Using JetBrains Mono as Geist alternative
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 15px rgba(197, 160, 89, 0.3)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
