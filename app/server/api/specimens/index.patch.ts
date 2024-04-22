export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const body = await readOneDocumentBodyOr400(event, { model: Specimen.Base, flat: true })

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
