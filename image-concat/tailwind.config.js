/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f9f9",
          100: "#dcf0ef",
          200: "#bde0dd",
          300: "#90c7c0",
          400: "#5da79e",
          500: "#3f8d85",
          600: "#33726c",
          700: "#2d5d59",
          800: "#294b48",
          900: "#253f3d"
        }
      },
      boxShadow: {
        panel: "0 12px 30px rgba(37, 63, 61, 0.12)"
      }
    }
  },
  plugins: [],
};

