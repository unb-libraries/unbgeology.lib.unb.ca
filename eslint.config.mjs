import { createConfigForNuxt } from "@nuxt/eslint-config/flat"
import tailwindcss from "eslint-plugin-tailwindcss"

export default createConfigForNuxt({
  features: {
    stylistic: true,
  },
})
  .append({
    ignores: [`app/**/*.js`],
  })
  .append(tailwindcss.configs[`flat/recommended`])
  .override(`nuxt/vue/rules`, {
    rules: {
      "vue/no-multiple-template-root": `warn`,
    },
  })
  .override(`nuxt/typescript/rules`, {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        `warn`,
        {
          args: `none`,
        },
      ],
    },
  })
  .override(`tailwindcss:rules`, {
    rules: {
      "tailwindcss/no-custom-classname": [
        `warn`,
        {
          config: `app/tailwind.config.js`,
          classRegex: `^twa-*$`,
          whitelist: [`placeholder`],
        },
      ],
    },
  })
