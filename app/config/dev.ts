import prodConfig from './prod'
import _ from "lodash"

export default _.merge(prodConfig, {
  modules: [
    `@nuxt/devtools`,
  ],
})
