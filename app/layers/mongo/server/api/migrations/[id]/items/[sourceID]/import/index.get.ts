import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id, sourceID } = getRouterParams(event)

  const migrationResources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r))
  const migration = await Migration.findByID(id).select(`authTags`)
  if (!migration) {
    return create404()
  } else if (!migrationResources.length || !migration.authTags.some(t => migrationResources.includes(t))) {
    return create403()
  }

  const resources = getAuthorizedResources(event, r => /^migrationitem(:\w)*$/.test(r))
  if (!resources.length) {
    return create403()
  }

  const item = await MigrationItem.mongoose.model.findOne()
    .where(`migration`).equals(parseObjectID(id))
    .where(`sourceID`).equals(sourceID)

  return (item && {
    self: getRequestURL(event).pathname,
    status: useEnum(MigrationItemStatus).labelOf(item.status).toLowerCase(),
    // TODO: Add creation and completion date
  }) || create404()
})
