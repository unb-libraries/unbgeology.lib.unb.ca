export default defineEventHandler((event) => {
  const { path } = event

  return Object
    .keys(Taxonomy.discriminators || {})
    .map(taxonomy => taxonomy.split(`.`).at(-1))
    .map(taxonomy => ({
      name: taxonomy,
      self: `${path}/${taxonomy!.toLowerCase()}`,
    }))
})
