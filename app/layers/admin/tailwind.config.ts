import { join } from "path"

export default {
  content: [
    join(__dirname, `components`, `**`, `*.{js,vue,ts}`),
    join(__dirname, `layouts`, `**`, `*.vue`),
    join(__dirname, `pages`, `**`, `*.vue`),
    join(__dirname, `plugins`, `**`, `*.{js,ts}`),
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: `#fff0f0`,
          dark: `#f77777`,
        },
      },
    },
  },
}
