export default defineNuxtConfig({
  extends: [
    `../../layers/local`,
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
