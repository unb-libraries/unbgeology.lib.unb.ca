import prodConfig from './prod'
import type { NuxtConfig } from "nuxt/config"

export default {
  ...prodConfig,
  modules: [
    ...prodConfig.modules || [],
    `@nuxt/devtools`,
  ],
} as NuxtConfig
