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
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length || !fields.includes(`data`)) {
    return create403()
  }

  const item = await MigrationItem.findOne()
    .join(`migration`, Migration)
    .where(`migration._id`).eq(parseObjectID(id))
    .and(`sourceID`).eq(parseInt(sourceID))
    .select(`data`)
    .select(`authTags`)

  if (item && !item.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  return item
    ? {
        ...item.data,
        self: `/api/migrations/${id}/items/${sourceID}/data`,
      }
    : create404()
})
