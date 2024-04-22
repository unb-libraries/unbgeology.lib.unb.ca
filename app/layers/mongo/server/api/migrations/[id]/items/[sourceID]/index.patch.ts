import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id, sourceID } = getRouterParams(event)

  const body = await readOneDocumentBodyOr400(event, { model: MigrationItem, flat: true })
  const update = await MigrationItem.updateOne(body)
    .where(`migration`).eq(parseObjectID(id))
    .and(`sourceID`).eq(parseInt(sourceID))

  if (update) {
    const [beforeStatus, afterStatus] = update.map(({ status }) => useEnum(MigrationItemStatus).valueOf(status))
    incrementItemStatusCount(id, createItemStatusCountUpdate(afterStatus, beforeStatus))
  }

  return renderDocumentDiffOr404(update, { model: MigrationItem, self: item => `/api/migrations/${id}/items/${item.sourceID}` })
})
