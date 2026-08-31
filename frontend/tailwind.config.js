/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070a10',
          900: '#0c121e',
          850: '#111928',
          800: '#172236',
          750: '#1e2c45',
          700: '#25354e',
          600: '#394d6e',
          500: '#51688f',
          400: '#758cb0',
          300: '#9cb0cf',
          200: '#c5d3e8',
          100: '#e5edf7',
          50: '#f4f7fc',
        },
        rubric: {
          DEFAULT: '#c82333',
          light: '#e03a4b',
          bright: '#ef4444',
          dark: '#8b1924',
          glow: 'rgba(200, 35, 51, 0.16)',
          faint: 'rgba(200, 35, 51, 0.08)',
        },
        parchment: {
          DEFAULT: '#fcf7ed',
          light: '#fffcf5',
          deep: '#f3e8d2',
          card: '#f8f2e4',
          border: '#e2d3b5',
          darkborder: '#cfbc96',
          ink: '#1a150e',
          muted: '#6b5e47',
          faint: '#99876c',
          amber: '#96742e',
        },
        grade: {
          sahih: {
            DEFAULT: '#4e7a57',
            border: '#62996e',
            bg: 'rgba(78, 122, 87, 0.18)',
            text: '#a3d9ad',
          },
          hasan: {
            DEFAULT: '#b58900',
            border: '#cca01f',
            bg: 'rgba(181, 137, 0, 0.18)',
            text: '#fad565',
          },
          daif: {
            DEFAULT: '#b85c38',
            border: '#d26f4b',
            bg: 'rgba(184, 92, 56, 0.18)',
            text: '#fca282',
          },
          unclassified: {
            DEFAULT: '#5c6b7f',
            border: '#78899f',
            bg: 'rgba(92, 107, 127, 0.18)',
            text: '#b7c6d9',
          },
        },
      },
      fontFamily: {
        sans: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        amiri: ['"Amiri"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(16, 185, 129, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
