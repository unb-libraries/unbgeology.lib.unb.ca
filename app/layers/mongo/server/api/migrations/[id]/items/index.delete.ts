export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const query = MigrationItem.delete()
    .where(`migration`).eq(parseObjectID(id))
  await useEventQuery(event, query)
  await query
  return sendNoContent(event)
})
