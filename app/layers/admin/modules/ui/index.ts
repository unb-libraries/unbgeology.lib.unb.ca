import {
  addComponentsDir,
  addImportsDir,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
} from "nuxt/kit"

export default defineNuxtModule({
  meta: {
    name: `@unb-libraries/nuxt-ui`,
    configKey: `ui`,
    compatibility: {
      nuxt: `>=3.0.0`,
    },
  },
  defaults: {},
  hooks: {},
  setup(moduleOptions, nuxt) {
    const resolver = createResolver(import.meta.url)

    addTypeTemplate({
      filename: `types/unb-libraries-nuxt-ui.d.ts`,
      src: resolver.resolve(`./types/index.d.ts`),
    })

    addComponentsDir({
      path: resolver.resolve(`./runtime/components`),
    })
  },
})
