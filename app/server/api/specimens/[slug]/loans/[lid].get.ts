export default defineEventHandler(async (event) => {
  const { slug, lid } = getRouterParams(event)

  const specimen = await Specimen.findBySlug(slug)
  const loan = specimen?.loans?.id(lid)

  return sendEntity(event, loan)
})
