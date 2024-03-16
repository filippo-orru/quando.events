/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        'accent': '#F0ADB4',
        'accent-light': '#FFCED3',
        'accent-dark': '#D18F95',
        'accent-800': '#6B2D31',

        'secondary': '#00C49A',
        'secondary-800': '#156064',
        'secondary-300': '#00F5C0',
        'secondary-100': '#b8faeb',
      }
    },
  },
  plugins: [],
}

