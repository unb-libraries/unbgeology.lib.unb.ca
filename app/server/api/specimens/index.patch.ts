export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const body = await readOneBodyOr400(event)

  const query = Specimen.Base.update(body)
  await useEventQuery(event, query)
  const { documents: updates } = await query
    .paginate(page, pageSize)

  return renderDocumentDiffList(updates, {
    model: Specimen.Base,
    canonical: {
      self: specimen => `/api/specimens/${specimen.slug}`,
    },
    self: () => `/api/specimens`,
  })
})
