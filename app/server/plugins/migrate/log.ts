import { consola } from "consola"

export default defineNitroPlugin((nitro) => {
  function getLabel(item: { get: (key: string) => string }) {
    return `${item.get(`migration.name`)}:${item.get(`sourceID`)}`
  }

  nitro.hooks.hook(`migrate:import:item:imported`, (item) => {
    consola.success(`Imported ${getLabel(item)}`)
  })

  nitro.hooks.hook(`migrate:import:item:updated`, (item) => {
    consola.success(`Updated ${getLabel(item)}`)
  })

  nitro.hooks.hook(`migrate:import:item:error`, (item, error) => {
    consola.error(`Error importing ${getLabel(item)}: ${error}`)
  })

  nitro.hooks.hook(`migrate:import:item:skipped`, (item) => {
    consola.info(`Skipped ${`${getLabel(item)}`}`)
  })

  nitro.hooks.hook(`migrate:rollback:item`, (item) => {
    consola.info(`Rollback ${getLabel(item)}`)
  })

  nitro.hooks.hook(`migrate:queue:done`, async (queue) => {
    const { modifiedCount: count } = await MigrationItem.mongoose.model.updateMany({ queue }, { $unset: { queue: 1 } })
    count && consola.info(`Processed ${count} items.`)
  })
})
