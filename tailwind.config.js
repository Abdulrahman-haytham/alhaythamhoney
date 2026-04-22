/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem'
      },
      screens: {
        xl: '1280px',
        '2xl': '1280px'
      }
    },
    extend: {
      colors: {
        gold: {
          50: '#fff9e6',
          100: '#ffefb3',
          200: '#ffe680',
          300: '#ffcc4d',
          400: '#f9d976',
          500: '#d4af37',
          600: '#b8860b',
          700: '#8b6508',
          800: '#5e4306',
          900: '#312203',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        amiri: ['Amiri', 'serif'],
      },
      animation: {
        'shine': 'shine 4s linear infinite',
        'marquee': 'marquee 20s linear infinite',
        'pulse-gold': 'pulse-gold 2s infinite ease-in-out',
        'fade-pulse': 'fade-pulse 1.5s infinite',
      },
      keyframes: {
        shine: {
          to: { backgroundPosition: '200% center' },
        },
        marquee: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 30px rgba(184, 134, 11, 0.2)', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 50px rgba(184, 134, 11, 0.4)', transform: 'scale(1.05)' },
        },
        'fade-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      boxShadow: {
        'luxury': '0 10px 40px -10px rgba(184, 134, 11, 0.2)',
        'luxury-lg': '0 20px 60px -15px rgba(184, 134, 11, 0.3)',
        'glow': '0 0 30px rgba(184, 134, 11, 0.3)',
      },
    },
  },
  plugins: [],
}
