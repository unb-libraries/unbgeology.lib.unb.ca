export default defineEventHandler((event) => {
  return Object
    .values(useAppConfig().entityTypes || {})
    .filter(entityType => [`Term`, `TaxonomyTerm`].includes(entityType.extends ?? ``))
    .map(({ name, baseURI }) => ({
      name,
      self: baseURI,
    }))
})
