export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const migrationResources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r), { action: `update` })
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

  const query = MigrationItem.delete()
    .where(`migration`).eq(parseObjectID(id))
    .and(`authTags`).in(resources)
  await useEventQuery(event, query)
  await query
  return sendNoContent(event)
})
