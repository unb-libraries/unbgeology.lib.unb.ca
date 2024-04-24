export default defineEventHandler(async (event) => {
  const { id, sourceID } = getRouterParams(event)

  const query = MigrationItem.findOne()
    .join(`migration`, Migration)
    .where(`migration._id`).eq(parseObjectID(id))
    .and(`sourceID`).eq(parseInt(sourceID))
    .select(`_sourceID, $sourceID`)
  await useEventQuery(event, query)
  const item = await query

  return renderDocumentOr404(item, {
    model: MigrationItem,
  })
})
