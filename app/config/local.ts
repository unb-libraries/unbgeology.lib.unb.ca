import devConfig from './dev'

export default defineNuxtConfig({
  ...devConfig,
  vite: {
    server: {
      hmr: {
        port: 31180,
      },
    },
  },
})
