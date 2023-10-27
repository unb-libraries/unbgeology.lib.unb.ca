export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const body = await readBody(event)

  const specimen = await Specimen.findByPK(slug)
  if (specimen) {
    const publication = specimen.publications?.create(body)
    specimen.publications?.push(publication)
    await specimen.save()
    return sendEntity(event, publication)
  }

  throw createError({ statusCode: 404 })
})
