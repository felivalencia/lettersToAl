/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        starlight: '#f9f9fb',
        nightsky: '#0d1117',
        nebula: {
          purple: '#6e44ff',
          blue: '#4285f4',
          teal: '#36bfb1',
          pink: '#ff66c4',
          orange: '#ff9e44'
        },
        cosmic: {
          dark: '#0a0a23',
          light: '#e9ecef'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
        mono: ['var(--font-space-mono)', 'monospace']
      },
      animation: {
        'star-pulse': 'star-pulse 4s ease-in-out infinite',
        'slow-spin': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        'star-pulse': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(0.95)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    }
  },
  plugins: []
} 