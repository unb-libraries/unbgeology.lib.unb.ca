export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^specimen(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const query = Specimen.Base.findOne()
  await useEventQuery(event, query)
  const specimen = await query
    .where(`slug`).eq(slug)
    .select(`authTags`)

  if (specimen && !specimen.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  return renderDocumentOr404(specimen, { model: Specimen.Base, fields })
})
