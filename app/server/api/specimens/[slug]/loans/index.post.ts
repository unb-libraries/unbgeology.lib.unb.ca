export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)

  const {
    organization: organizationURI,
    ...body
  } = await readBody(event)

  if (organizationURI) {
    body.organization = await Organization.findByURI(organizationURI)
  }

  const specimen = await Specimen.findByPK(slug)
  if (specimen) {
    const loan = specimen.loans?.create(body)
    specimen.loans?.push(loan)
    await specimen.save()
    return sendEntity(event, loan)
  }

  throw createError({ statusCode: 404 })
})
