// https://nuxt.com/docs/api/configuration/nuxt-config
import config from './nuxt'

const { DEPLOY_ENV } = process.env
const nuxtConfig = config[DEPLOY_ENV as "dev" | "prod" | "local"]

export default defineNuxtConfig(nuxtConfig)