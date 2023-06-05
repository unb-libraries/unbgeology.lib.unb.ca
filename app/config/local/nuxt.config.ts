export default defineNuxtConfig({
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
