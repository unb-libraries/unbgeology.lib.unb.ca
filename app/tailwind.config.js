/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    `./components/**/*.{js,vue,ts}`,
    `./layouts/**/*.vue`,
    `./pages/**/*.vue`,
    `./plugins/**/*.{js,ts}`,
    `./node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}`,
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
