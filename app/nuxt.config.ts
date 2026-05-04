import url from "url"
import { mkdirSync, existsSync, writeFileSync } from "fs"
import { createResolver } from "nuxt/kit"
import { createSamlMetadata, initSaml } from "./saml/saml"

// https://nuxt.com/docs/api/configuration/nuxt-config
const {
  APP_ROOT,
  NUXT_SAML_ENTRY_POINT,
  NUXT_SAML_CALLBACK_URL,
  NUXT_SAML_ISSUER,
  NUXT_SAML_CERT,
} = process.env

export default defineNuxtConfig({
  extends: [
    `./layers/local`,
    `./layers/mongo`,
    `./layers/primevue`,
  ],
  $development: {
    buildDir: './.build/.nuxt',
    runtimeConfig: {
      session: {
        cookie: {
          secure: false,
        },
        maxAge: 2592000, // 30 days
      },
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        { rel: `icon`, type: `image/svg+xml`, href: `/favicon.svg` },
        { rel: `icon`, type: `image/vnd.microsoft.icon`, href: `/favicon.ico` },
        { rel: `icon`, type: `image/png`, sizes: `16x16`, href: `/favicon-16x16.png` },
        { rel: `icon`, type: `image/png`, sizes: `32x32`, href: `/favicon-32x32.png` },
        { rel: `apple-ch-icon`, sizes: `180x180`, href: `/apple-touch-icon.png` },
        { rel: `mask-icon`, href: `/safari-pinned-tab.svg`, color: `#900000` },
        { rel: `manifest`, href: `/site.webmanifest` },
      ],
      meta: [
        { name: `application-name`, content: `Earth Science Collections | UNB Libraries` },
        { name: `geo.region`, content: `CA-NB` },
        { name: `geo.position`, content: `45.946153; -66.643089` },
        { name: `geo.placename`, content: `Fredericton` },
        { name: `msapplication-config`, content: `/browserconfig.xml` },
        { name: `msapplication-TileColor`, content: `#2b5797` },
        { name: `theme-color`, content: `#ffffff` },
        { name: 'color-scheme', content: 'light dark' },
        { 'http-equiv': `content-language`, 'content': `en` },
        { property: 'og:type', content: 'website' },
        { property: 'og:description', content: "The Earth Science Collection project provides digital access to the Quartermain Centre's collections of historically significant minerals, rocks, and fossils." },
        { name: 'description', content: "The Earth Science Collection project provides digital access to the Quartermain Centre's collections of historically significant minerals, rocks, and fossils." },
      ],
    },
  },
  alias: {
    "document-types": url.fileURLToPath(new URL(`./server/documentTypes`, import.meta.url)),
    "vocabularies": url.fileURLToPath(new URL(`./server/vocabularies`, import.meta.url)),
    "layers": url.fileURLToPath(new URL(`./layers`, import.meta.url)),
    "types": url.fileURLToPath(new URL(`./types`, import.meta.url)),
  },
  buildDir: `/app/html/.build/.nuxt`,
  css: [
    `~/assets/css/main.css`,
  ],
  devtools: {
    enabled: true,
  },
  hooks: {
    'nitro:init': (nitro) => {
      const { resolve } = createResolver(`/tmp`)

      const samlDir = resolve(`saml`)
      mkdirSync(samlDir, { recursive: true })

      initSaml(nitro.options.runtimeConfig.saml)
      writeFileSync(resolve(`saml`, `metadata.xml`), createSamlMetadata(),
      )

      nitro.options.publicAssets.push({
        baseURL: `saml`,
        dir: samlDir,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    },
    'nitro:config': (nitroConfig) => {
      const { dir } = nitroConfig.runtimeConfig!.uploads as { dir: string }
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
    },
  },
  runtimeConfig: {
    saml: {
      entryPoint: NUXT_SAML_ENTRY_POINT || ``,
      callbackUrl: NUXT_SAML_CALLBACK_URL || ``,
      issuer: NUXT_SAML_ISSUER || ``,
      cert: NUXT_SAML_CERT || ``,
      validateInResponseTo: `never`,
      disableRequestedAuthnContext: true,
    },
    public: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxTotalFileSize: 200 * 1024 * 1024, // 200MB
      // TODO: Increase when useFileUpload composable is able to return all uploaded images' URLS
      maxFiles: 25,
      session: {
        name: `sessionId`,
      },
    },
    defaultUser: `anonymous`,
    session: {
      maxAge: 24 * 60 * 60, // 1 day
      password: ``,
    },
    uploads: {
      dir: `/app/files`,
      uri: `/files`,
    },
  },
  nitro: {
    experimental: {
      openAPI: true,
    },
    publicAssets: [
      {
        baseURL: `leaflet/img/`,
        dir: `../node_modules/leaflet/dist/images`,
      },
    ],
    storage: {
      cache: {
        driver: `redis`,
        host: ``,
        port: ``,
        base: `unbgeology-lib-unb-ca`,
      },
      db: {
        driver: `fs`,
        base: `${APP_ROOT}/../.data/db`,
      },
    },
    imports: {
      dirs: [
        `./server/documentTypes/*`,
        `./layers/*/server/documentTypes/*`,
        `./server/vocabularies/*`,
      ],
    },
  },
  vite: {
    server: {
      hmr: {
        port: 31180,
      },
    },
  },
})
