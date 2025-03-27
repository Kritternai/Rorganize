/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        prompt: ["'Prompt'", "sans-serif"],
      },
      animation: {
        fadeZoom: "fadeZoom 1.2s ease-out",
        fadeIn: "fadeIn 1.2s ease-out",
      },
      keyframes: {
        fadeZoom: {
          "0%": { opacity: 0, transform: "scale(1.05)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};