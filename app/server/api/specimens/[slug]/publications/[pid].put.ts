export default defineEventHandler(async (event) => {
  const { slug, pid } = getRouterParams(event)
  const body = await readBody(event)

  const specimen = await Specimen.findByPK(slug)
  const publication = specimen.publications?.id(pid)
  for (const field in body) {
    publication[field] = body[field]
  }
  await specimen.save()

  return sendEntity(event, publication)
})
