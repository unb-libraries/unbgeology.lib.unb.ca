import type { NuxtConfig } from "nuxt/config"

export default {
  buildDir: `/app/html/.build/.nuxt`,
  css: [`~/assets/css/main.css`],
  modules: [
    `@sidebase/nuxt-session`,
    `~/modules/auth/index.ts`,
    `~/modules/saml/index.ts`,
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
