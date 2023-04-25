import { ValidateInResponseTo } from "@node-saml/node-saml/lib/types"
import { SAML } from "@node-saml/node-saml"

export default defineNuxtPlugin(() => {
  const {
    entrypoint: entryPoint,
    assertionConsumerServiceUrl: callbackUrl,
    issuer,
    idpCert: cert,
  } = useRuntimeConfig().public.saml

  const saml = new SAML({
    entryPoint,
    callbackUrl,
    issuer,
    cert,
    validateInResponseTo: ValidateInResponseTo.never,
    disableRequestedAuthnContext: true,
  })

  return {
    provide: {
      saml,
    },
  }
})
