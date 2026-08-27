/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FAF8F5',
          100: '#F4F0E8',
          200: '#EAE3D2',
          300: '#D5CFC2',
          400: '#B8AFA0',
          border: '#E7E2D6',
        },
        ink: {
          900: '#1C1917',
          800: '#292524',
          700: '#44403C',
          600: '#57534E',
          500: '#78716C',
          muted: '#A8A29E',
        },
        natural: {
          moss: '#2D5A27',
          terracotta: '#C2593F',
          ochre: '#D97706',
          indigo: '#1E3A8A',
          amber: '#B45309',
          bark: '#7C2D12',
          forest: '#1B4332',
          sand: '#D4A373',
        },
        iucn: {
          cr: '#7F1D1D',
          en: '#DC2626',
          vu: '#D97706',
          nt: '#CA8A04',
          lc: '#15803D',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'natural': '0 4px 20px -2px rgba(68, 64, 60, 0.08)',
        'natural-lg': '0 10px 30px -5px rgba(68, 64, 60, 0.12)',
        'paper-card': '0 2px 8px rgba(44, 40, 36, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      }
    },
  },
  plugins: [],
}
