export default defineEventHandler(async (event) => {
  const { slug, lid } = getRouterParams(event)

  const body = await readBody(event)
  const specimen = await Specimen.findBySlug(slug)
  const loan = specimen?.loans?.id(lid)
  for (const field in body) {
    loan[field] = body[field]
  }
  await specimen.save()

  return sendEntity(event, loan)
})
