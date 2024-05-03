export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { pageSize, page } = getQueryOptions(event)

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

  const query = MigrationItem.find()
    .join(`migration`, Migration)
    .where(`migration._id`).eq(parseObjectID(id))
    .and(`authTags`).in(resources)
    .select([`_sourceID`, `$sourceID`])
  await useEventQuery(event, query)
  const { documents: items, total } = await query
    .paginate(page, pageSize)

  return renderDocumentList(items, {
    total,
    model: MigrationItem,
    canonical: {
      fields,
      // @ts-ignore
      self: item => `/api/migrations/${id}/items/${item._sourceID}`,
    },
    self: () => `/api/migrations/${id}/items`,
  })
})
