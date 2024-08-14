import { MigrationItemStatus, type EntityJSON, type MigrationItem } from "@unb-libraries/nuxt-layer-entity"

export default defineNitroPlugin(async (nitro) => {
  const { consola } = await import(`consola`)
  nitro.hooks.hook(`migrate:rollback:item`, (item) => {
    // Depending on item's status, create, update, or reject rollback of item
    const Status = useEnum(MigrationItemStatus)
    const status = Status.valueOf(item.status)
    if (status & (MigrationItemStatus.IMPORTED | MigrationItemStatus.ERRORED)) {
      consola.info(`Rollback ${item.migration.name}:${item.id}`)
      doRollback(item)
    } else {
      const label = Status.labelOf(status)
      throw new Error(`Cannot import "${label}" item`)
    }
  })

  function doRollback(item: EntityJSON<MigrationItem>) {
    // Rollback logic here
  }
})
