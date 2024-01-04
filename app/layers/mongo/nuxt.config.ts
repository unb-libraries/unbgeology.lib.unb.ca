// https://v3.nuxtjs.org/api/configuration/nuxt.config

export default defineNuxtConfig({
  buildDir: `./.build/.nuxt`,
  runtimeConfig: {
    nitro: {
      mongodb: {
        uri: ``,
        host: `localhost`,
        port: 27017,
        db: `db`,
        user: `user`,
        pass: `pass`,
        authSource: ``,
      },
    },
  },
})
