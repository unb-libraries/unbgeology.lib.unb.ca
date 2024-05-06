export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const resources = getAuthorizedResources(event, r => /^specimen(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const query = Specimen.Base.find()
    .where(`authTags`).in(resources)
  await useEventQuery(event, query)

  const { documents: specimens, total } = await query
    .paginate(page, pageSize)

  return renderDocumentList(specimens, {
    model: Specimen.Base,
    canonical: {
      fields,
      self: specimen => `/api/specimens/${specimen.slug}`,
    },
    total,
  })
})
