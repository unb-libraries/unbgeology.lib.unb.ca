import url from "url"

// https://nuxt.com/docs/api/configuration/nuxt-config
const { DEPLOY_ENV } = process.env

export default defineNuxtConfig({
  extends: [
    `./config/${DEPLOY_ENV}`,
    `./layers/primevue`,
    `./layers/mongo`,
    `./layers/base`,
  ],
  alias: {
    "entity-types": url.fileURLToPath(new URL(`./server/entityTypes`, import.meta.url)),
    "taxonomies": url.fileURLToPath(new URL(`./server/taxonomies`, import.meta.url)),
    "layers": url.fileURLToPath(new URL(`./layers`, import.meta.url)),
    "types": url.fileURLToPath(new URL(`./types`, import.meta.url)),
  },
  nitro: {
    imports: {
      dirs: [
        `./server/entityTypes/*`,
        `./server/taxonomies/*`,
      ],
    },
  },
})
