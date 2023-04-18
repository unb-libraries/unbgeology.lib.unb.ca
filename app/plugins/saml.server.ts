import { ValidateInResponseTo } from "@node-saml/node-saml/lib/types"
import { SAML } from "@node-saml/node-saml"

export default defineNuxtPlugin(() => {
  const {
    SAML_ENTRYPOINT,
    SAML_ASSERTION_CONSUMER_SERVICE_URL,
    SAML_ISSUER,
    SAML_IDP_CERT,
  } = process.env as Record<string, string>

  const saml = new SAML({
    entryPoint: SAML_ENTRYPOINT,
    callbackUrl: SAML_ASSERTION_CONSUMER_SERVICE_URL,
    issuer: SAML_ISSUER,
    cert: SAML_IDP_CERT,
    validateInResponseTo: ValidateInResponseTo.never,
    disableRequestedAuthnContext: true,
  })

  return {
    provide: {
      saml,
    },
  }
})
