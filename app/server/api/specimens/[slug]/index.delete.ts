export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^specimen(:\w)*$/.test(r))
  if (!resources.length) {
    return create403()
  }

  const specimen = await Specimen.Base.deleteOne()
    .where(`slug`).eq(slug)
    .select(`authTags`)

  if (specimen && !specimen.authTags.some(t => resources.includes(t))) {
    return create403()
  } else if (!specimen) {
    return create404(`Specimen entity "${slug}" not found.`)
  }

  return sendNoContent(event)
})
