export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { pageSize, page } = getQueryOptions(event)

  const query = MigrationItem.find()
    .where(`migration`).eq(parseObjectID(id))
    .select(`migration`)
    .select([`_sourceID`, `$sourceID`])
  await useEventQuery(event, query)
  const { documents: items, total } = await query
    .paginate(page, pageSize)

  return renderDocumentList(items, {
    total,
    model: MigrationItem,
    canonical: {
      // @ts-ignore
      self: item => `/api/migrations/${id}/items/${item._sourceID}`,
    },
    self: () => `/api/migrations/${id}/items`,
  })
})
