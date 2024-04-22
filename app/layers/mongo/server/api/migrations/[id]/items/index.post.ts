import { type MigrationItem } from "../../../../../server/documentTypes/MigrationItem"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const body = {
    migration: parseObjectID(id),
    ...await readDocumentBodyOr400<MigrationItem>(event, { model: MigrationItem }),
  }
  const oneOrManyItems = await MigrationItem.create(body)

  return Array.isArray(oneOrManyItems)
    ? renderDocumentList(oneOrManyItems, {
      model: MigrationItem,
      canonical: {
        self: item => `/api/migrations/${id}/items/${item.sourceID}`,
      },
      self: () => `/api/migrations/${id}/items/`,
    })
    : renderDocument(oneOrManyItems, {
      model: MigrationItem,
      self: item => `/api/migrations/${id}/items/${item.sourceID}`,
    })
})
