import { existsSync, mkdirSync } from 'fs'

export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: `icon`, type: `image/svg+xml`, href: `/favicon.svg` },
        { rel: `icon`, type: `image/vnd.microsoft.icon`, href: `/favicon.ico` },
        { rel: `icon`, type: `image/png`, sizes: `16x16`, href: `/favicon-16x16.png` },
        { rel: `icon`, type: `image/png`, sizes: `32x32`, href: `/favicon-32x32.png` },
        { rel: `apple-touch-icon`, sizes: `180x180`, href: `/apple-touch-icon.png` },
        { rel: `mask-icon`, href: `/safari-pinned-tab.svg`, color: `#900000` },
        { rel: `manifest`, href: `/site.webmanifest` },
      ],
      meta: [
        { name: `application-name`, content: `UNBGeology | Earth Science Collections | UNB Libraries` },
        { name: `geo.region`, content: `CA-NB` },
        { name: `geo.position`, content: `45.946153; -66.643089` },
        { name: `geo.placename`, content: `Fredericton` },
        { name: `msapplication-config`, content: `/browserconfig.xml` },
        { name: `msapplication-TileColor`, content: `#2b5797` },
        { name: `theme-color`, content: `#ffffff` },
        { 'http-equiv': `content-language`, 'content': `en` },
      ],
    },
  },
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
