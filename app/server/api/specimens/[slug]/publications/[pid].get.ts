export default defineEventHandler(async (event) => {
  const { slug, pid } = getRouterParams(event)

  const specimen = await Specimen.findByPK(slug)
  const publication = specimen.publications?.id(pid)

  return sendEntity(event, publication)
})
