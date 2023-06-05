import { writeFileSync } from "fs"
import { SAML } from "@node-saml/node-saml"
import { createResolver } from "nuxt/kit"

export default defineNuxtPlugin(() => {
  const saml = new SAML(useRuntimeConfig().public.saml)

  const { resolve } = createResolver(import.meta.url)
  writeFileSync(resolve(`../public/saml/metadata.xml`), saml.generateServiceProviderMetadata(null))

  return {
    provide: {
      saml,
    },
  }
})
