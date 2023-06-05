// https://v3.nuxtjs.org/api/configuration/nuxt.config

export default defineNuxtConfig({
  build: {
    transpile: [`primevue`],
  },
  buildDir: `./.build/.nuxt`,
  css: [
    `primevue/resources/themes/lara-light-blue/theme.css`,
    `primevue/resources/primevue.css`,
  ],
})
