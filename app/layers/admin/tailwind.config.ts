import { join } from "path"

export default {
  content: [
    join(__dirname, `components`, `**`, `*.{js,vue,ts}`),
    join(__dirname, `layouts`, `**`, `*.vue`),
    join(__dirname, `pages`, `**`, `*.vue`),
    join(__dirname, `plugins`, `**`, `*.{js,ts}`),
  ],
  theme: {
    colors: {
      white: `#FFFFFF`,
      base: {
        dark: {
          600: `#12161A`,
          500: `#1C2227`,
          400: `#252D33`,
          300: `#2E3840`,
          200: `#37434D`,
          100: `#404E5A`,
        },
        default: `#495966`,
        light: {
          100: `#606E79`,
          200: `#77838C`,
          300: `#8D979F`,
          400: `#A4ACB3`,
          500: `#BBC1C6`,
          600: `#D2D6D9`,
        },
      },
      red: `#EA0029`,
    },
    fontSize: {
      50: `0.5rem`,
      75: `0.75rem`,
      100: `16px`,
      125: `1.25rem`,
      150: `1.5rem`,
      200: `2rem`,
      400: `4rem`,
    },
    spacing: {
      0: `0`,
      25: `0.25em`,
      50: `0.5em`,
      75: `0.75em`,
      100: `1em`,
      125: `1.25em`,
      150: `1.5em`,
      200: `2em`,
      400: `4em`,
      800: `8em`,
      px: `1px`,
    },
  },
}
