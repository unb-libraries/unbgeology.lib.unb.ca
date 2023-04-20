import devConfig from './dev'

export default {
  ...devConfig,
  vite: {
    server: {
      hmr: {
        port: 31180,
      },
    },
  },
}
