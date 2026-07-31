export default defineCachedEventHandler(async () => {
  return useSaml().generateServiceProviderMetadata()
}, { maxAge: 60 * 60 * 24 }) // Cache for 24 hours
