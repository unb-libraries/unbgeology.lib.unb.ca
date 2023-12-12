/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors"

module.exports = {
  content: [
    `./components/**/*.{js,vue,ts}`,
    `./layers/primevue/plugins/primevue.ts`,
    `./layouts/**/*.vue`,
    `./layers/**/*.vue`,
    `./pages/**/*.vue`,
    `./plugins/**/*.{js,ts}`,
    `./node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}`,
  ],
  theme: {
    extend: {
      aspectRatio: {
        '4/3': `4 / 3`,
        '7/5': `7 / 5`,
      },
      colors: {
        base: `#E3E1D9`,
        primary: {
          DEFAULT: `#000000`,
          20: `#B6B4AE`,
          40: `#888782`,
          60: `#5B5A57`,
          80: `#2D2D2B`,
        },
        accent: {
          light: `#73D0B9`,
          mid: `#3FA085`,
          dark: `#00695D`,
        },
        blue: {
          light: colors.blue[500],
          DEFAULT: colors.blue[600],
          dark: colors.blue[700],
        },
        red: {
          light: colors.red[500],
          DEFAULT: colors.red[600],
          dark: colors.red[700],
        },
        yellow: {
          light: colors.amber[300],
          DEFAULT: colors.amber[400],
          dark: colors.amber[500],
        },
      },
    },
  },
  plugins: [
    require(`@tailwindcss/forms`),
  ],
}
