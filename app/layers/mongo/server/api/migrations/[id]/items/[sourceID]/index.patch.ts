import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id, sourceID } = getRouterParams(event)

  const migrationResources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r), { action: `update` })
  const migration = await Migration.findByID(id).select(`authTags`)
  if (!migration) {
    return create404()
  } else if (!migrationResources.length || !migration.authTags.some(t => migrationResources.includes(t))) {
    return create403()
  }

  const resources = getAuthorizedResources(event, r => /^migrationitem(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const body = await readOneDocumentBodyOr400(event, { model: MigrationItem, flat: true, fields })
  const update = await MigrationItem.updateOne(body)
    .join(`migration`, Migration)
    .where(`migration._id`).eq(parseObjectID(id))
    .and(`sourceID`).eq(parseInt(sourceID))

  if (update) {
    const [beforeStatus, afterStatus] = update.map(({ status }) => useEnum(MigrationItemStatus).valueOf(status))
    incrementItemStatusCount(id, createItemStatusCountUpdate(afterStatus, beforeStatus))
  }

  return renderDocumentDiffOr404(update, {
    model: MigrationItem,
    fields,
    self: item => `/api/migrations/${id}/items/${item.sourceID}`,
  })
})
