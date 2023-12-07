export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  const { domain, type, slug } = getRouterParams(event)

  const { parent: parentURI, ...body } = await readBody(event)
  if (parentURI) {
    const parent = await TermBase.findByURI(parentURI)
    if (parent) {
      body.parent = parent
    }
  } else if (parentURI === null) {
    body.parent = null
  }

  await TermBase.findOneAndUpdate({ type: `${domain}.${type}`, slug }, body, { new: true })
  return await $fetch(pathname)
})
