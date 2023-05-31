// https://nuxt.com/docs/api/configuration/nuxt-config
const { DEPLOY_ENV } = process.env

export default defineNuxtConfig({
  extends: [
    `@unb-libraries/nuxt-layer-base`,
    `./config/${DEPLOY_ENV}`,
  ],
})
