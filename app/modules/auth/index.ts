import { join } from "path"
import { defineNuxtModule, addRouteMiddleware } from "@nuxt/kit"

export default defineNuxtModule({
  meta: {
    name: `auth`,
    configKey: `auth`,
    compatibility: {
      nuxt: `^3.0.0`,
    },
  },
  defaults: {},
  hooks: {},
  setup(moduleOptions, nuxt) {
    addRouteMiddleware(
      {
        name: `auth`,
        path: join(__dirname, `middleware`, `auth.global.ts`),
        global: true,
      })
  },
})
