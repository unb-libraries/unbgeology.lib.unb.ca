export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)

  const query = Specimen.Base.findOne()
  await useEventQuery(event, query)
  const specimen = await query
    .where(`slug`).eq(slug)

  return renderDocumentOr404(specimen, { model: Specimen.Base })
})
