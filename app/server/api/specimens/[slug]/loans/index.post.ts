export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)

  const body = await readBody(event)
  const specimen = await Specimen.findBySlug(slug)
  if (specimen) {
    const loan = specimen.loans?.create(body)
    specimen.loans?.push(loan)
    await specimen.save()
    return sendEntity(event, loan)
  }

  throw createError({ statusCode: 404 })
})
