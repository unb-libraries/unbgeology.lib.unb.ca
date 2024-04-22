export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const query = Migration.findByID(id)
  await useEventQuery(event, query)
  const migration = await query
  return renderDocumentOr404(migration, { model: Migration })
})
