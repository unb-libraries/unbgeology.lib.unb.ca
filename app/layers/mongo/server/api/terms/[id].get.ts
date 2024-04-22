export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const query = Term.findByID(id)
  await useEventQuery(event, query)
  const term = await query

  return renderDocumentOr404(term, { model: Term })
})
