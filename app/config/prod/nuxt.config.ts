export default defineNuxtConfig({
  buildDir: `/app/html/.build/.nuxt`,
  css: [
    `~/assets/css/main.css`,
    // REFACTOR: only load this on pages with maps
    `~/node_modules/leaflet/dist/leaflet.css`,
  ],
  nitro: {
    publicAssets: [
      {
        baseURL: `leaflet/img/`,
        dir: `../node_modules/leaflet/dist/images`,
      },
    ],
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
