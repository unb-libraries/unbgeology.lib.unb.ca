import { initSaml, createSamlMetadata } from "~/saml/saml"

export default defineCachedEventHandler(async (event) => {
  const { saml: samlConfig } = useRuntimeConfig(event)
  initSaml(samlConfig)
  return createSamlMetadata()
}, { maxAge: 60 * 60 * 24 }) // Cache for 24 hours