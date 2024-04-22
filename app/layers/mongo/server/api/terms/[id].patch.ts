export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readOneDocumentBodyOr400(event, { model: Term, flat: true })
  const update = await Term.updateByID(id, body)

  return renderDocumentDiffOr404(update, { model: Term })
})
