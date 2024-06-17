import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { pageSize, page } = getQueryOptions(event)

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
  const query = MigrationItem.update(body)
  await useEventQuery(event, query)
  const { documents: updates, total } = await query
    .join(`migration`, Migration)
    .where(`migration._id`).eq(parseObjectID(id))
    .and(`authTags`).in(resources)
    .paginate(page, pageSize)

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
      fields,
      self: item => `/api/migrations/${id}/items/${item.sourceID}`,
    },
    self: () => `/api/migrations/${id}/items`,
    total,
  })
})
