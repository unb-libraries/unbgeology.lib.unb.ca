export default defineEventHandler(async (event) => {
  const { slug, lid } = getRouterParams(event)

  const specimen = await Specimen.findByPK(slug)
  const loan = specimen?.loans?.id(lid)

  return sendEntity(event, loan)
})
