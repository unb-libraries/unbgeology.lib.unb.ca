export default defineEventHandler(async (event) => {
  const resources = getAuthorizedResources(event)
  const pattern = new RegExp(resources.map(res => `^${res}`).join(`|`))
  const fields = getAuthorizedFields(event, ...resources)

  if (resources.length < 1) {
    return create403()
  }

  const query = Term.find()
    .where(`authTags`).match(pattern)
  await useEventQuery(event, query)

  const { page, pageSize } = getQueryOptions(event)
  const { documents: terms, total } = await query
    .paginate(page, pageSize)

  return renderDocumentList(terms, { total, model: Term, canonical: { fields } })
})
