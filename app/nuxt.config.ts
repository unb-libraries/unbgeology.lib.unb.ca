import url from "url"

// https://nuxt.com/docs/api/configuration/nuxt-config
const { DEPLOY_ENV } = process.env

export default defineNuxtConfig({
  extends: [
    `./config/${DEPLOY_ENV}`,
    `./layers/base`,
    `./layers/mongo`,
    `./layers/primevue`,
    `./layers/admin`,
  ],
  alias: {
    "document-types": url.fileURLToPath(new URL(`./server/documentTypes`, import.meta.url)),
    "vocabularies": url.fileURLToPath(new URL(`./server/vocabularies`, import.meta.url)),
    "layers": url.fileURLToPath(new URL(`./layers`, import.meta.url)),
    "types": url.fileURLToPath(new URL(`./types`, import.meta.url)),
  },
  nitro: {
    imports: {
      dirs: [
        `./server/documentTypes/*`,
        `./layers/*/server/documentTypes/*`,
        `./server/vocabularies/*`,
      ],
    },
  },
})
