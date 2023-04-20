import prodConfig from './prod'

export default {
  ...prodConfig,
  modules: [
    ...prodConfig.modules,
    `@nuxt/devtools`,
  ],
}
