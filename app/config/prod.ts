import type { NuxtConfig } from "nuxt/config"

export default {
  buildDir: `/app/html/.build/.nuxt`,
  css: [`~/assets/css/main.css`],
  modules: [
    `@sidebase/nuxt-session`,
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      saml: {
        entrypoint: ``,
        assertionConsumerServiceUrl: ``,
        issuer: ``,
        idpCert: ``,
      },
    },
  },
} as NuxtConfig
