export default defineEventHandler(async (event) => {
  const { domain, type } = getRouterParams(event)

  const { parent: parentURI, ...body } = await readBody(event)
  if (parentURI) {
    const parent = await TermBase.findByURI(parentURI)
    if (parent) {
      body.parent = parent
    }
  }

  const term = await TermBase.create({ ...body, type: `${domain}.${type}` })
  if (term) {
    return $fetch(term.uri)
  }
})
