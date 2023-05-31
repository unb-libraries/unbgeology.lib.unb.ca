// https://nuxt.com/docs/api/configuration/nuxt-config
const { DEPLOY_ENV } = process.env

export default defineNuxtConfig({
  extends: [
    `./config/${DEPLOY_ENV}`,
  ],
})
