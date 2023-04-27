import devConfig from './dev'
import type { NuxtConfig } from "nuxt/config"

export default {
  ...devConfig,
  session: {
    session: {
      cookieSecure: false,
    },
  },
  vite: {
    server: {
      hmr: {
        port: 31180,
      },
    },
  },
} as NuxtConfig
