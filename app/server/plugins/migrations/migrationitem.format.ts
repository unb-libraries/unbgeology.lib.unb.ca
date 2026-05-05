import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineMongooseFormatter(MigrationItem, async (doc, { self }) => {
  // @ts-ignore
  const { data, sourceID, migration, entityURI, error, queue, status, created, updated } = doc
  return {
    id: `${sourceID}`,
    data: data && {
      ...data,
      self: `${self(doc)}/data`,
    },
    migration: migration && await renderDocument(migration, {
      model: Migration,
      self: migration => `/api/migrations/${migration._id}`,
    }),
    entityURI,
    error,
    queue,
    status: status && useEnum(MigrationItemStatus).labelOf(status).toLowerCase(),
    created: (created && !isNaN(created) && new Date(created).toISOString()) || undefined,
    updated: (updated && !isNaN(updated) && new Date(updated).toISOString()) || undefined,
  }
})
