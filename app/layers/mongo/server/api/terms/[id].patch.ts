export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event)
  const fields = getAuthorizedFields(event, ...resources)

  const term = await Term.findByID(id).select(`authTags`)
  const pattern = new RegExp(resources.map(res => `^${res}$`).join(`|`))
  if (term && term.authTags.some(tag => pattern.test(tag))) {
    return create403()
  }

  const body = await readOneDocumentBodyOr400(event, { model: Term, flat: true, fields })
  const update = await term?.update(body)

  return renderDocumentDiffOr404(update, { model: Term, fields })
})
