export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const body = await readOneDocumentBodyOr400(event, { model: Term, flat: true })
  const query = Term.update(body)
  await useEventQuery(event, query)

  const { documents: updates, total } = await query
    .paginate(page, pageSize)

  return renderDocumentDiffList(updates, { total, model: Term })
})
