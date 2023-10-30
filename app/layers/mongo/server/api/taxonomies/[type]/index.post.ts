export default defineEventHandler(async (event) => {
  const { type } = getRouterParams(event)

  const { parent: parentURI, ...body } = await readBody(event)
  if (parentURI) {
    const parent = await Taxonomy.findByURI(parentURI)
    if (parent) {
      body.parent = parent
    }
  }

  const term = await Taxonomy.create({ ...body, type })
  if (term) {
    return $fetch(term.uri)
  }
})
