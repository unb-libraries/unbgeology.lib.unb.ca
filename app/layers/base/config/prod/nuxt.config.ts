import { mkdirSync, writeFileSync } from "fs"
import { SAML } from "@node-saml/node-saml"
import { ValidateInResponseTo } from "@node-saml/node-saml/lib/types"
import { createResolver } from "nuxt/kit"

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

      const saml = new SAML(nitro.options.runtimeConfig.public.saml)
      writeFileSync(
        resolve(`saml`, `metadata.xml`),
        saml.generateServiceProviderMetadata(null),
      )

      nitro.options.publicAssets.push({
        baseURL: `saml`,
        dir: samlDir,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    },
  },
  nitro: {
    runtimeConfig: {
      public: {
        saml: {
          entryPoint: NUXT_PUBLIC_SAML_ENTRY_POINT || ``,
          callbackUrl: NUXT_PUBLIC_SAML_CALLBACK_URL || ``,
          issuer: NUXT_PUBLIC_SAML_ISSUER || ``,
          cert: NUXT_PUBLIC_SAML_CERT || ``,
          validateInResponseTo: ValidateInResponseTo.never,
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
      session: {
        name: `sessionId`,
      },
    },
    session: {
      maxAge: 24 * 60 * 60, // 1 day
      password: ``,
    },
  },
})
