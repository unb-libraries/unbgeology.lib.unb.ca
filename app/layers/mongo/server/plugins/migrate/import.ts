import { MigrationItemStatus, type EntityJSON, type MigrationItem } from "@unb-libraries/nuxt-layer-entity"

export default defineNitroPlugin(async (nitro) => {
  const { consola } = await import(`consola`)
  nitro.hooks.hook(`migrate:import:item`, (item) => {
    // Depending on item's status, create, update, or reject import of item
    const Status = useEnum(MigrationItemStatus)
    const status = Status.valueOf(item.status)
    if (status === MigrationItemStatus.INITIAL) {
      consola.info(`Importing ${item.migration.name}:${item.id}`)
      doImport(item)
    } else if (status === MigrationItemStatus.IMPORTED) {
      consola.info(`Updating ${item.migration.name}:${item.id}`)
      doImport(item)
    } else {
      const label = Status.labelOf(status)
      throw new Error(`Cannot import "${label}" item`)
    }
  })

  function doImport(item: EntityJSON<MigrationItem>) {
    // Import logic here
  }
})
