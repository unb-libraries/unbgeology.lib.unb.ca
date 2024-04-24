export default defineEventHandler(async (event) => {
  const { id, sourceID } = getRouterParams(event)
  const item = await MigrationItem.findOne()
    .join(`migration`, Migration)
    .where(`migration._id`).eq(parseObjectID(id))
    .and(`sourceID`).eq(parseInt(sourceID))
    .select(`data`)

  return item
    ? {
        ...item.data,
        self: `/api/migrations/${id}/items/${sourceID}/data`,
      }
    : create404()
})
