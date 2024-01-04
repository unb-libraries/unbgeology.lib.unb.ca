import type { ValidateInResponseTo } from "@node-saml/node-saml"

export type SamlOptions = {
  entryPoint: string
  callbackUrl: string
  issuer: string
  cert: string
  validateInResponseTo: ValidateInResponseTo
  disableRequestedAuthnContext: boolean
}
export interface SAMLProfile {
  uid: string
  mail: string
  telephoneNumber: string
  eduPersonScopedAffiliation: string[]
  eduPersonPrincipalName: string
  l: string
  sn: string
  givenName: string
  title: string
}
