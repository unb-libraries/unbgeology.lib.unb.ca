export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const resources = getAuthorizedResources(event, r => /^term(:\w)*$/.test(r))

  const term = await Term.findByID(id).select(`authTags`)
  if (term && term.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  await term?.delete()
  return term ? sendNoContent(event) : create404()
})
