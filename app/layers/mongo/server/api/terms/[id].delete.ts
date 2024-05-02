export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const resources = getAuthorizedResources(event)

  const term = await Term.findByID(id).select(`authTags`)
  const pattern = new RegExp(resources.map(res => `^${res}`).join(`|`))
  if (term && term.authTags.some(tag => pattern.test(tag))) {
    return create403()
  }

  await term?.delete()
  return term ? sendNoContent(event) : create404()
})
