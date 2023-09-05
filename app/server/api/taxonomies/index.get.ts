import Taxonomy from "entity-types/Taxonomy"

export default defineEventHandler((event) => {
  const { path } = event

  return Object
    .keys(Taxonomy.discriminators || {})
    .map(taxonomy => ({
      name: taxonomy,
      self: `${path}/${taxonomy.toLowerCase()}`,
    }))
})
