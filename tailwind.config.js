/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F0F0F",      // Black
        accent: "#C6A75E",       // Gold
        background: "#F5F5F5",   // Off White
        textMain: "#1C1C1C",     // Charcoal
        secondary: "#6B7280",    // Warm Gray
      }
    },
  },
  plugins: [],
}

