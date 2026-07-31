import { type AuthOptions, SAML, type SamlConfig } from '@node-saml/node-saml'
import { defu } from 'defu'

type SAMLProfile = {
  uid: string
  mail: string
  telephoneNumber: string
  sn: string
  givenName: string
}

let saml: SAML

export function useSaml() {
  if (!saml) {
    const config = defu(useRuntimeConfig().saml, {
      validateInResponseTo: 'never',
      disableRequestedAuthnContext: true,
    })
    saml = new SAML(config as SamlConfig)
  }

  return {
    async getAuthUrl(host: string, options: AuthOptions) {
      return await saml.getAuthorizeUrlAsync('', host, options)
    },
    generateServiceProviderMetadata() {
      return saml.generateServiceProviderMetadata(null)
    },
    async getProfile(response: string) {
      const { profile } = await saml.validatePostResponseAsync({ SAMLResponse: response })
      return profile?.attributes as SAMLProfile
    },
  }
}
