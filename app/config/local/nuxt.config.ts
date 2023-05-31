export default defineNuxtConfig({
  // session: {
  //   session: {
  //     cookieSecure: false,
  //   },
  // },
  extends: [
    `../dev`,
  ],
  vite: {
    server: {
      hmr: {
        port: 31180,
      },
    },
  },
})
