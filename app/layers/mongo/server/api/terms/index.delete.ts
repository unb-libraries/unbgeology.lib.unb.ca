export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const resources = getAuthorizedResources(event)
  const pattern = new RegExp(resources.map(res => `^${res}`).join(`|`))

  if (resources.length < 1) {
    return create403()
  }

  const query = Term.delete()
    .where(`authTags`).match(pattern)
  await useEventQuery(event, query)
  await query
    .paginate(page, pageSize)

  return sendNoContent(event)
})
