import { join } from "path"
import { defineNuxtModule, createResolver, addPlugin, extendPages } from "nuxt/kit"

import { ValidateInResponseTo } from "@node-saml/node-saml/lib/types"

const {
  SAML_ENTRYPOINT: entryPoint,
  SAML_ASSERTION_CONSUMER_SERVICE_URL: callbackUrl,
  SAML_ISSUER: issuer,
  SAML_IDP_CERT: idpCert,
} = process.env

const samlPages = [
  {
    name: `login`,
    path: `/login`,
    file: join(__dirname, `pages`, `login`, `index.vue`),
  }, {
    name: `saml`,
    path: `/login/saml`,
    file: join(__dirname, `pages`, `login`, `saml.vue`),
  }, {
    name: `logout`,
    path: `/logout`,
    file: join(__dirname, `pages`, `logout.vue`),
  },
]

export default defineNuxtModule({
  meta: {
    name: `saml`,
    configKey: `saml`,
    compatibility: {
      nuxt: `^3.0.0`,
    },
  },
  defaults: {
    entryPoint: entryPoint || ``,
    callbackUrl: callbackUrl || ``,
    issuer: issuer || ``,
    cert: idpCert || ``,
    validateInResponseTo: ValidateInResponseTo.never,
    disableRequestedAuthnContext: true,
  },
  hooks: {},
  setup(moduleOptions, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    addPlugin(resolve(`./runtime/plugins/saml.server`))
    extendPages((pages) => { pages.push(...samlPages) })

    nuxt.options.runtimeConfig.public.saml = moduleOptions
  },
})
