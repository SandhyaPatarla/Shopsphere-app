/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#166534',
          light: '#22c55e',
          dark: '#14532d',
          soft: '#dcfce7',
        },
        accent: {
          DEFAULT: '#65a30d',
          bright: '#84cc16',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#e7f5ec',
        },
        background: '#f0fdf4',
        text: {
          DEFAULT: '#14532d',
          muted: '#4d7c5c',
        },
      },
      boxShadow: {
        card: '0 4px 24px -4px rgb(22 101 52 / 0.12)',
      },
    },
  },
  plugins: [],
}
