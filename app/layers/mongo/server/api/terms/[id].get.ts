export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event)
  const fields = getAuthorizedFields(event, ...resources)

  const query = Term.findByID(id)
  await useEventQuery(event, query)

  const term = await query
  const pattern = new RegExp(resources.map(res => `^${res}`).join(`|`))
  if ((term && !term.authTags.some(tag => pattern.test(tag))) || resources.length < 1) {
    return create403()
  }
  return await renderDocumentOr404(term, { model: Term, fields })
})
