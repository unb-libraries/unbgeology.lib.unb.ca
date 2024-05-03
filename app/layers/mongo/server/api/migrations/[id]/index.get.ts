export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const query = Migration.findByID(id).select(`authTags`)
  await useEventQuery(event, query)
  const migration = await query
  if (migration && !migration.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  return renderDocumentOr404(migration, { model: Migration, fields })
})
