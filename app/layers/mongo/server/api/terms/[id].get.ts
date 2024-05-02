export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^term(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)

  const query = Term.findByID(id).select(`authTags`)
  await useEventQuery(event, query)

  const term = await query
  if (term && !term.authTags.some(t => resources.includes(t))) {
    return create403()
  }
  return await renderDocumentOr404(term, { model: Term, fields })
})
