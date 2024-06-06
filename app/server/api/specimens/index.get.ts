export default defineEventHandler(async (event) => {
  const { page, pageSize, search } = getQueryOptions(event)

  const resources = getAuthorizedResources(event, r => /^specimen(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const query = search ? Specimen.Base.search(search) : Specimen.Base.find()
  query.where(`authTags`).in(resources)
  await useEventQuery(event, query)

  const { documents: specimens, total } = await query
    .select([`_slug`, `$slug`])
    .paginate(page, pageSize)

  return renderDocumentList(specimens, {
    model: Specimen.Base,
    canonical: {
      fields,
      // @ts-ignore
      self: specimen => `/api/specimens/${specimen._slug}`,
    },
    total,
  })
})
