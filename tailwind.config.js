/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The exact Gold from your video
        primary: '#FFD700', 
        // Deep void black, not just grey
        dark: '#050505', 
        // Lighter black for cards
        surface: '#121212',
        // Muted gold for text
        'gold-muted': '#C5A059' 
      },
      fontFamily: {
        // "Taste the Future" font
        serif: ['"Playfair Display"', 'serif'], 
        // UI/Button font
        sans: ['"Manrope"', 'sans-serif'],
      },
      backgroundImage: {
        'void-gradient': 'radial-gradient(circle at 50% 0%, #1a1a1a 0%, #050505 100%)',
      }
    },
  },
  plugins: [],
}