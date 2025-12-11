/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arc: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          dark: '#1e293b',
          light: '#f8fafc',
        },
      },
    },
  },
  plugins: [],
}
