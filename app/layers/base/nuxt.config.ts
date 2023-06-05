// https://v3.nuxtjs.org/api/configuration/nuxt.config

const { DEPLOY_ENV } = process.env
export default defineNuxtConfig({
  buildDir: `./.build/.nuxt`,
  extends: [
    `./config/${DEPLOY_ENV || `local`}`,
  ],
})
