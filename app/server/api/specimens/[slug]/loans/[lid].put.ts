export default defineEventHandler(async (event) => {
  const { slug, lid } = getRouterParams(event)
  
  const {
    organization: organizationURI,
    ...body
  } = await readBody(event)
  
  if (organizationURI) {
    body.organization = await Organization.findByURI(organizationURI)
  }
  
  const specimen = await Specimen.findByPK(slug)
    .populate(`loans.organization`, `_id`)
  const loan = specimen?.loans?.id(lid)
  for (const field in body) {
    loan[field] = body[field]
  }
  await specimen.save()
  
  return sendEntity(event, loan)
})
