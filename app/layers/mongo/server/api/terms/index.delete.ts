export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const resources = getAuthorizedResources(event, r => /^term(:\w)*$/.test(r))

  if (resources.length < 1) {
    return create403()
  }

  const query = Term.delete()
    .where(`authTags`).in(resources)
  await useEventQuery(event, query)
  await query
    .paginate(page, pageSize)

  return sendNoContent(event)
})
