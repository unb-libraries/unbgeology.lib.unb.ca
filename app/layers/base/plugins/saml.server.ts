import { SAML } from "@node-saml/node-saml"

export default defineNuxtPlugin(() => {
  const saml = new SAML(useRuntimeConfig().public.saml)
  return {
    provide: {
      saml,
    },
  }
})
