export default defineNuxtConfig({
  buildDir: `/app/html/.build/.nuxt`,
  css: [
    `~/assets/css/main.css`,
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
