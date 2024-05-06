export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const resources = getAuthorizedResources(event, r => /^specimen(:\w)*$/.test(r))
  if (!resources.length) {
    return create403()
  }

  const query = Specimen.Base.delete()
    .where(`authTags`).in(resources)
  await useEventQuery(event, query)
  await query
    .paginate(page, pageSize)

  return sendNoContent(event)
})
