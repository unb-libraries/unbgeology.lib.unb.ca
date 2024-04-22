export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const query = Migration.find()
  await useEventQuery(event, query)
  const { documents: migrations, total } = await query
    .paginate(page, pageSize)
  return renderDocumentList(migrations, { model: Migration, total })
})
