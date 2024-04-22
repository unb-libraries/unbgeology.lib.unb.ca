import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineMongooseFormatter(MigrationItem, (doc) => {
  const { data, sourceID, status, created, updated } = doc
  return {
    id: sourceID,
    data: data && {
      ...data,
      self: (() => {
        const event = useEvent()
        if (event) {
          const { id, sourceID } = getRouterParams(event)
          return `/api/migrations/${id}/items/${sourceID}/data`
        }
      })(),
    },
    status: status && useEnum(MigrationItemStatus).labelOf(status).toLowerCase(),
    created: (created && !isNaN(created) && new Date(created).toISOString()) || undefined,
    updated: (updated && !isNaN(updated) && new Date(updated).toISOString()) || undefined,
  }
})
