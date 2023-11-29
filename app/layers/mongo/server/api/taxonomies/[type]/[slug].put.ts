export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  const { type, slug } = getRouterParams(event)

  const { parent: parentURI, ...body } = await readBody(event)
  if (parentURI) {
    const parent = await Taxonomy.findByURI(parentURI)
    if (parent) {
      body.parent = parent
    }
  } else if (parentURI === null) {
    body.parent = null
  }

  await Taxonomy.findOneAndUpdate({ type, slug }, body, { new: true })
  return await $fetch(pathname)
})
