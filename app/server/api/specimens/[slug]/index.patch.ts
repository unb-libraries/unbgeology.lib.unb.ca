export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^specimen(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const body = await readOneDocumentBodyOr400(event, { model: Specimen.Base, flat: true, flattenExcept: [`portion`], fields })
  const specimen = await Specimen.Base.findOne()
    .where(`slug`).eq(slug)

  if (specimen && !specimen.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  const update = await specimen?.update(body)
  return renderDocumentDiffOr404(update, { model: Specimen.Base, fields })
})
