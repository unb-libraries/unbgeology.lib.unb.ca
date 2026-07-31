import type { SamlConfig } from '@node-saml/node-saml'

declare module 'nuxt/schema' {
  type RuntimeConfig = {
    saml: SamlConfig
  }
}

export {}
