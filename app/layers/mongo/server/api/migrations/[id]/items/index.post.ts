import { type MigrationItem } from "../../../../../server/documentTypes/MigrationItem"

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
  const fields = getAuthorizedFields(event, ...resources)
  if (!migrationResources.length || !resources.length) {
    return create403()
  }

  const body = {
    migration: parseObjectID(id),
    ...await readDocumentBodyOr400<MigrationItem>(event, { model: MigrationItem, fields }),
  }
  const oneOrManyItems = await MigrationItem.create(body)

  return Array.isArray(oneOrManyItems)
    ? renderDocumentList(oneOrManyItems, {
      model: MigrationItem,
      canonical: {
        fields,
        self: item => `/api/migrations/${id}/items/${item.sourceID}`,
      },
      self: () => `/api/migrations/${id}/items/`,
    })
    : renderDocument(oneOrManyItems, {
      model: MigrationItem,
      fields,
      self: item => `/api/migrations/${id}/items/${item.sourceID}`,
    })
})
