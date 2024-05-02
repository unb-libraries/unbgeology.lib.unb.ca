export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const resources = getAuthorizedResources(event)
  const pattern = new RegExp(resources.map(res => `^${res}`).join(`|`))
  const fields = getAuthorizedFields(event, ...resources)

  if (resources.length < 1) {
    return create403()
  }

  const body = await readOneDocumentBodyOr400(event, { model: Term, flat: true, fields })
  const query = Term.update(body)
    .where(`authTags`).match(pattern)
  await useEventQuery(event, query)

  const { documents: updates, total } = await query
    .paginate(page, pageSize)

  return renderDocumentDiffList(updates, { total, model: Term })
})
