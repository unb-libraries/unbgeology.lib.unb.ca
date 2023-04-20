import devConfig from './dev'

export default {
  ...devConfig,
  session: {
    session: {
      cookieSecure: false,
    },
  },
  vite: {
    server: {
      hmr: {
        port: 31180,
      },
    },
  },
}
