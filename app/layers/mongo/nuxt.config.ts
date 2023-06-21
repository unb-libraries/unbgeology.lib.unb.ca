// https://v3.nuxtjs.org/api/configuration/nuxt.config

export default defineNuxtConfig({
  buildDir: `./.build/.nuxt`,
  runtimeConfig: {
    mongodb: {
      uri: ``,
      authDb: `admin`,
    },
  },
})
