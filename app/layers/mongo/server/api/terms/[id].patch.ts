export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^term(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)

  const term = await Term.findByID(id).select(`authTags`)
  if (term && !term.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  const body = await readOneDocumentBodyOr400(event, { model: Term, flat: true, flattenExcept: [`parent`], fields })
  const update = await term?.update(body)

  return renderDocumentDiffOr404(update, { model: Term, fields })
})
