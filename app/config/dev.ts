import prodConfig from './prod'

export default {
  ...prodConfig,
  modules: [
    `@nuxt/devtools`,
    `@sidebase/nuxt-session`,
  ],
}
