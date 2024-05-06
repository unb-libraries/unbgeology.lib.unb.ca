export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const resources = getAuthorizedResources(event, r => /^specimen(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const body = await readOneDocumentBodyOr400(event, { model: Specimen.Base, flat: true, fields })
  const query = Specimen.Base.update(body)
    .where(`authTags`).in(resources)
  await useEventQuery(event, query)
  const { documents: updates } = await query
    .paginate(page, pageSize)

  return renderDocumentDiffList(updates, {
    model: Specimen.Base,
    canonical: {
      fields,
      self: specimen => `/api/specimens/${specimen.slug}`,
    },
    self: () => `/api/specimens`,
  })
})
