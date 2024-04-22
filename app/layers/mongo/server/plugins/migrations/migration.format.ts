import { MigrationStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineMongooseFormatter(Migration, async (doc) => {
  const { _id, name, entityType, source: sources, dependencies, total, imported, skipped, errored, status, created, updated } = doc
  return {
    id: _id && `${_id}`,
    name,
    entityType,
    source: sources && await renderDocumentList(sources, { model: FileBase }),
    dependencies: dependencies && await renderDocumentList(dependencies, { model: Migration }),
    total,
    imported,
    skipped,
    errored,
    status: status && useEnum(MigrationStatus).labelOf(status).toLowerCase(),
    created: (created && !isNaN(created) && new Date(created).toISOString()) || undefined,
    updated: (updated && !isNaN(updated) && new Date(updated).toISOString()) || undefined,
  }
})
