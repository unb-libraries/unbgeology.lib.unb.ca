/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors"
import plugin from "tailwindcss/plugin"
import defaults from "tailwindcss/defaultTheme"

const colorReduce = (prefix = ``) =>
  (reduced, [key, value]) =>
    typeof value === `string`
      ? [...reduced, [prefix ? key.toLowerCase() !== `default` ? `${prefix}-${key}` : prefix : key, value]]
      : Object.entries(value).reduce(colorReduce(key), reduced)

const minMaxWH = {
  '1/2': `50%`,
  '1/3': `33%`,
  '2/3': `66%`,
  '1/4': `25%`,
  '3/4': `75%`,
  '1/5': '20%',
  '2/5': '40%',
  '3/5': '60%',
  '4/5': '80%',
}

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
        green: {
          light: colors.green[400],
          DEFAULT: colors.green[500],
          dark: colors.green[600],
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
      maxWidth: minMaxWH,
      minWidth: minMaxWH,
      maxHeight: minMaxWH,
      minHeight: minMaxWH,
      strokeWidth: {
        '1.5': `1.5`
      }
    },
  },
  plugins: [
    require(`@tailwindcss/forms`),
    plugin(function ({ addComponents, matchComponents, theme }) {
      const matchComponentsBySize = (name, sizes, styles = {}) => matchComponents({
        [name]: ({ fontSize, paddingX, paddingY, borderRadius }) => ({
          fontSize,
          padding: `${paddingY} ${paddingX}`,
          borderRadius,
          ...styles,
        })
      }, { values: sizes })

      addComponents({
        ".button": {
          display: `flex`,
          width: `fit-content`,
          cursor: `pointer`,
          alignItems: `center`,
          justifyContent: `center`,
        },
      })
      
      matchComponents({
        button: rgbColor => ({
          backgroundColor: rgbColor,
          color: `inherit`,
        }),
        "button-outline": rgbColor => ({
          borderColor: rgbColor,
          backgroundColor: `transparent`,
          borderWidth: `1px`,
          color: rgbColor,
        })
      }, {
        values: Object.fromEntries(Object.entries(theme(`colors`)).reduce(colorReduce(), []))
      })
      
      matchComponentsBySize(`button`, theme(`button`))
      matchComponentsBySize(`input-text`, theme(`input`))
      matchComponentsBySize(`input-number`, theme(`input`))
      matchComponentsBySize(`input-select`, theme(`input`), {
        cursor: `pointer`,
        justifyContent: `flex-start`,
      })
      matchComponentsBySize(`input-textarea`, theme(`input`), {
        padding: "2px",
      })
      matchComponentsBySize(`icon`, theme(`icon`), {
        fill: "none",
        stroke: "currentColor",
      })
    }, {
      theme: {
        button: {
          sm: {
            fontSize: defaults.fontSize.sm,
            borderRadius: defaults.borderRadius.md,
            paddingX: defaults.spacing[2],
            paddingY: defaults.spacing[0.5],
          },
          md: {
            fontSize: defaults.fontSize.md,
            borderRadius: defaults.borderRadius.md,
            paddingX: defaults.spacing[2],
            paddingY: defaults.spacing[1.5],
          },
          lg: {
            fontSize: defaults.fontSize.lg,
            borderRadius: defaults.borderRadius.md,
            paddingX: defaults.spacing[3],
            paddingY: defaults.spacing[2],
          },
        },
        input: {
          sm: {
            fontSize: defaults.fontSize.sm,
            borderRadius: defaults.borderRadius.md,
            paddingX: defaults.spacing[2],
            paddingY: defaults.spacing[1],
          },
          md: {
            fontSize: defaults.fontSize.md,
            borderRadius: defaults.borderRadius.lg,
            paddingX: defaults.spacing[3],
            paddingY: defaults.spacing[1.5],
          },
          lg: {
            fontSize: defaults.fontSize.lg,
            borderRadius: defaults.borderRadius.lg,
            paddingX: defaults.spacing[3],
            paddingY: defaults.spacing[2],
          },
        },
        icon: {
          sm: {
            width: defaults.width[4],
            height: defaults.height[4],
            strokeWidth: 2,
          },
          md: {
            width: defaults.width[5],
            height: defaults.height[5],
            strokeWidth: 1.5,
          },
          lg: {
            width: defaults.width[6],
            height: defaults.height[6],
            strokeWidth: 1.5,
          },
        }
      },
    }),
  ],
}
