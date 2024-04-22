import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const body = await readOneDocumentBodyOr400(event, { model: MigrationItem, flat: true })
  const query = MigrationItem.update(body)
  await useEventQuery(event, query)
  const { documents: updates, total } = await query
    .where(`migration`).eq(parseObjectID(id))

  if (updates.length > 0) {
    const countUpdate = updates
      .map((update) => {
        const [before, after] = update.map(({ status }) => useEnum(MigrationItemStatus).valueOf(status))
        return createItemStatusCountUpdate(after, before)
      })
    incrementItemStatusCount(id, ...countUpdate)
  }

  return renderDocumentDiffList(updates, {
    model: MigrationItem,
    canonical: {
      self: item => `/api/migrations/${id}/items/${item.sourceID}`,
    },
    self: () => `/api/migrations/${id}/items`,
    total,
  })
})
