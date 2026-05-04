import {
  initSaml as init,
  createSamlMetadata as createMetadata,
  getSamlAuthUrl as getAuthUrl,
  getSamlProfile as getProfile,
} from "../saml/saml"

export default defineNuxtPlugin(() => {
  return {
    provide: {
      saml: {
        init,
        createMetadata,
        getAuthUrl,
        getProfile,
      },
    },
  }
})
