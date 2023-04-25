export default {
  buildDir: `/app/html/.build/.nuxt`,
  modules: [
    `@sidebase/nuxt-session`,
  ],
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
}
