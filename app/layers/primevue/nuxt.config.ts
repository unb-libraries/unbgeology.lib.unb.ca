// https://v3.nuxtjs.org/api/configuration/nuxt.config

export default defineNuxtConfig({
  build: {
    transpile: [`primevue`],
  },
  buildDir: `./.build/.nuxt`,
  modules: [
    `@nuxt/image`,
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
