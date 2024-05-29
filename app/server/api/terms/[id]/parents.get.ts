export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^term(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)

  if (resources.length < 1) {
    return create403()
  }

  const term = await Term.findByID(id).select(`authTags`)
  if (!term) {
    return create404()
  } else if (term && !term.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  const query = Term.find()
    .where(`authTags`).in(resources)
    .and(`__l`).lt(term.__l)
    .and(`__r`).gt(term.__r)
  await useEventQuery(event, query)

  const { documents: parents, total } = await query
    .paginate(page, pageSize)

  return renderDocumentList(parents, {
    total,
    model: Term,
    canonical: {
      fields,
      self: ({ _id }) => `/api/terms/${_id}`,
    },
  })

  return parents
})
