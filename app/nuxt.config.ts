import url from "url"
import { mkdirSync, existsSync } from "fs"

// https://nuxt.com/docs/api/configuration/nuxt-config
const {
  APP_ROOT,
  NODE_ENV,
} = process.env

export default defineNuxtConfig({
  extends: [
    `./layers/local`,
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
      uploads: {
        dir: `/uploads`,
        pruneOrphans: true,
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
  build: {
    transpile: [`primevue`],
  },
  buildDir: `./.build/.nuxt`,
  css: [
    `~/assets/css/main.css`,
  ],
  devtools: {
    enabled: true,
  },
  hooks: {
    'nitro:config': (nitroConfig) => {
      const { dir } = nitroConfig.runtimeConfig!.uploads as { dir: string }
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
    },
  },
  modules: ['@nuxt/image', '@nuxtjs/sitemap', '@nuxtjs/robots'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    nitro: {
      mongodb: {
        uri: ``,
        host: `localhost`,
        port: 27017,
        db: `db`,
        user: `user`,
        pass: `pass`,
        authSource: ``,
      },
      defaultSchemaVersion: {
        specimens: 2,
      },
    },
    saml: {
      entryPoint: ``,
      callbackUrl: ``,
      issuer: ``,
      cert: ``,
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
      pruneOrphans: false,
    },
  },
  site: {
    url: `https://unbgeology.lib.unb.ca`,
    name: `Earth Science Collections | UNB Libraries`,
    env: NODE_ENV,
  },
  sitemap: {
    cacheMaxAgeSeconds: 60 * 60 * 24, // 24 hours
    exclude: [/^\/dashboard/],
    sources: [
      `/api/_sitemap/urls/specimens`,
    ],
  },
  robots: {
    disallow: NODE_ENV !== `production` ? `/` : undefined,
  },
  nitro: {
    experimental: {
      openAPI: true,
      asyncContext: true,
      tasks: true,
    },
    publicAssets: [
      {
        baseURL: `leaflet/img/`,
        dir: `../node_modules/leaflet/dist/images`,
      },
    ],
    storage: {
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
    optimizeDeps: {
      include: [
        `@vue/devtools-core`,
        `@vue/devtools-kit`,
        `doi-regex`,
        `leaflet`,
        `leaflet-gesture-handling`,
        `leaflet.markercluster`,
        `@vueuse/router`,
      ],
    },
    server: {
      allowedHosts: ['local-unbgeology.lib.unb.ca'],
      hmr: {
        port: 31180,
      },
    },
  },
})
