import { SAML } from "@node-saml/node-saml"
import { ValidateInResponseTo } from "@node-saml/node-saml/lib/types"

export default defineNuxtPlugin(() => {
  const samlConfig = {
    ...useRuntimeConfig().public.saml,
    validateInResponseTo: ValidateInResponseTo.never,
  }

  return {
    provide: {
      saml: new SAML(samlConfig),
    },
  }
})
