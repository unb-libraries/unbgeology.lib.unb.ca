import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"
import { consola } from "consola"

export default defineNitroPlugin((nitro) => {
  function getLabel(item: { get: (key: string) => string }) {
    return `${item.get(`migration.name`)}:${item.get(`sourceID`)}`
  }

  nitro.hooks.hook(`migrate:import:item:imported`, (item) => {
    const label = `${getLabel(item)}`
    consola.success(`Imported ${label}`)
  })

  nitro.hooks.hook(`migrate:import:item:updated`, (item) => {
    const label = `${getLabel(item)}`
    consola.success(`Updated ${label}`)
  })

  nitro.hooks.hook(`migrate:import:item:error`, (item, error) => {
    const label = `${getLabel(item)}: ${error}`
    consola.error(`Error importing ${label}`)
  })

  nitro.hooks.hook(`migrate:rollback:item`, (item) => {
    const status = item.get(`status`)
    if (status & (MigrationItemStatus.IMPORTED | MigrationItemStatus.ERRORED | MigrationItemStatus.QUEUED)) {
      consola.info(`Rollback ${getLabel(item)}`)
    }
  })

  nitro.hooks.hook(`migrate:queue:done`, async (queue) => {
    const { modifiedCount: count } = await MigrationItem.mongoose.model.updateMany({ queue }, { $unset: { queue: 1 } })
    count && consola.info(`Processed ${count} items.`)
  })
})
