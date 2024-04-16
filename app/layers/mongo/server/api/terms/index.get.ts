export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const query = Term.find()
  await useEventQuery(event, query)

  const { documents: terms, total } = await query
    .paginate(page, pageSize)

  return renderDocumentList(terms, { total, model: Term })
})
