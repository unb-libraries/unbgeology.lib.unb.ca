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
  if (!resources.length) {
    return create403()
  }

  const query = MigrationItem.findOne()
    .join(`migration`, Migration)
    .where(`migration._id`).eq(parseObjectID(id))
    .and(`sourceID`).eq(parseInt(sourceID))
    .select(`_sourceID, $sourceID`)
    .select(`authTags`)
  await useEventQuery(event, query)

  const item = await query
  if (item && !item.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  return renderDocumentOr404(item, {
    model: MigrationItem,
    fields,
  })
})
