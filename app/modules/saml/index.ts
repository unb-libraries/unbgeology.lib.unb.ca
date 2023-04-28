import { join } from "path"
import { defineNuxtModule, createResolver, addPlugin, extendPages } from "nuxt/kit"

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
  defaults: {},
  hooks: {},
  setup(moduleOptions, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    addPlugin(resolve(`./runtime/plugins/saml.server`))
    extendPages((pages) => { pages.push(...samlPages) })
  },
})
