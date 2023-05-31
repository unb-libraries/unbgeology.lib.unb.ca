export default defineNuxtConfig({
  build: {
    transpile: [
      `primevue`,
    ],
  },
  buildDir: `/app/html/.build/.nuxt`,
  css: [
    `~/assets/css/main.css`,
    // TODO: Replace this with our own theme
    `primevue/resources/themes/lara-light-blue/theme.css`,
    `primevue/resources/primevue.css`,
  ],
  // modules: [
  // `@sidebase/nuxt-session`,
  // `~/modules/auth/index.ts`,
  // `~/modules/saml/index.ts`,
  // ],
  nitro: {
    storage: {
      db: {
        driver: `fs`,
        base: `/app/data/db`,
      },
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
