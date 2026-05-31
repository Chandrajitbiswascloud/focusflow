/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./focusflow.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        slate: {
          950: '#070a13',
        },
        obsidian: {
          bg: '#05070c',
          card: '#0a0d16',
          border: '#151b2e',
          accent: '#6366f1',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
