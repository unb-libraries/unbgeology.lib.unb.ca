import { existsSync, mkdirSync } from 'fs'

export default defineNuxtConfig({
  buildDir: `/app/html/.build/.nuxt`,
  css: [
    `~/assets/css/main.css`,
  ],
  hooks: {
    'nitro:config': (nitroConfig) => {
      const { dir } = nitroConfig.runtimeConfig!.uploads as { dir: string }
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
    },
  },
  nitro: {
    publicAssets: [
      {
        baseURL: `leaflet/img/`,
        dir: `../node_modules/leaflet/dist/images`,
      },
    ],
    runtimeConfig: {
      uploads: {
        dir: `/app/files`,
        uri: `/files`,
      },
    },
  },
})
