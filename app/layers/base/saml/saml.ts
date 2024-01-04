import { SAML } from "@node-saml/node-saml"
import type { AuthorizeOptions } from "@node-saml/node-saml/lib/passport-saml-types"
import type { SAMLOptions, SAMLProfile } from "../types/saml"

let saml: SAML

export function initSaml(config: SAMLOptions) {
  if (!saml) {
    saml = new SAML(config)
  }
}

export function createSamlMetadata() {
  if (!saml) {
    throw new Error(`SAML is not initialized.`)
  }
  return saml.generateServiceProviderMetadata(null)
}

export async function getSamlAuthUrl(host: string, options: AuthorizeOptions) {
  if (!saml) {
    throw new Error(`SAML is not initialized.`)
  }
  return await saml.getAuthorizeUrlAsync(``, host, options)
}

export async function getSamlProfile(response: string): Promise<SAMLProfile> {
  if (!saml) {
    throw new Error(`SAML is not initialized.`)
  }

  const { profile } = await saml.validatePostResponseAsync({ SAMLResponse: response })
  return profile?.attributes
}
