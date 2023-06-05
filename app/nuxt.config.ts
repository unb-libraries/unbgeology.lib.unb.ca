// https://nuxt.com/docs/api/configuration/nuxt-config
const { DEPLOY_ENV } = process.env

export default defineNuxtConfig({
  extends: [
    `./config/${DEPLOY_ENV}`,
    `./layers/primevue`,
    `@unb-libraries/nuxt-layer-base`,
  ],
})
