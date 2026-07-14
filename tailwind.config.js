/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
        playfair: ['Playfair Display', 'serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
        fira: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-lg': '8px 8px 0px 0px #000000',
        'pop': '3px 3px 0px 0px #2e263d',
        'pop-lg': '6px 6px 0px 0px #2e263d',
        'pop-xl': '9px 9px 0px 0px #2e263d',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
