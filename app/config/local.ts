import devConfig from './dev'
import _ from 'lodash'

export default _.merge({
  ...devConfig,
  vite: {
    server: {
      hmr: {
        port: 31180,
      },
    },
  },
})
