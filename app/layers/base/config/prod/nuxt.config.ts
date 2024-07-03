import { mkdirSync, writeFileSync } from "fs"
import { createResolver } from "nuxt/kit"
import { createSamlMetadata, initSaml } from "../../saml/saml"

const {
  APP_ROOT,
  NUXT_PUBLIC_SAML_ENTRY_POINT,
  NUXT_PUBLIC_SAML_CALLBACK_URL,
  NUXT_PUBLIC_SAML_ISSUER,
  NUXT_PUBLIC_SAML_CERT,
} = process.env

export default defineNuxtConfig({
  hooks: {
    'nitro:init': (nitro) => {
      const { resolve } = createResolver(`/tmp`)

      const samlDir = resolve(`saml`)
      mkdirSync(samlDir, { recursive: true })

      initSaml(nitro.options.runtimeConfig.public.saml)
      writeFileSync(resolve(`saml`, `metadata.xml`), createSamlMetadata(),
      )

      nitro.options.publicAssets.push({
        baseURL: `saml`,
        dir: samlDir,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    },
  },
  nitro: {
    experimental: {
      openAPI: true,
    },
    runtimeConfig: {
      public: {
        saml: {
          entryPoint: NUXT_PUBLIC_SAML_ENTRY_POINT || ``,
          callbackUrl: NUXT_PUBLIC_SAML_CALLBACK_URL || ``,
          issuer: NUXT_PUBLIC_SAML_ISSUER || ``,
          cert: NUXT_PUBLIC_SAML_CERT || ``,
          validateInResponseTo: `never`,
          disableRequestedAuthnContext: true,
        },
      },
    },
    storage: {
      db: {
        driver: `fs`,
        base: `${APP_ROOT}/../.data/db`,
      },
    },
  },
  runtimeConfig: {
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
  },
})
