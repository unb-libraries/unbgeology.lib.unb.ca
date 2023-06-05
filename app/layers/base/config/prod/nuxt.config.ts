import { ValidateInResponseTo } from "@node-saml/node-saml/lib/types"

const { APP_ROOT } = process.env

export default defineNuxtConfig({
  nitro: {
    storage: {
      db: {
        driver: `fs`,
        base: `${APP_ROOT}/../.data/db`,
      },
    },
  },
  runtimeConfig: {
    public: {
      saml: {
        entryPoint: ``,
        callbackUrl: ``,
        issuer: ``,
        cert: ``,
        validateInResponseTo: ValidateInResponseTo.never,
        disableRequestedAuthnContext: true,
      },
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
