/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aegis: {
          dark: '#0f172a',
          brand: '#3b82f6',
          accent: '#10b981'
        }
      }
    },
  },
  plugins: [],
};