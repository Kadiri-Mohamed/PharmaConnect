/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#A0C878",
        accent: "#DDEB9D",
        surface: "#FAF6E9",
        background: "#FFFDF6"
      }
    }
  },
  plugins: [],
}