import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"
import { consola } from "consola"

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`migrate:import:item:transform`, (item) => {
    const entityURI = item.get(`entityURI`)
    const status = item.get(`status`)
    const migrationName = item.get(`migration.name`)
    const sourceID = item.get(`sourceID`)

    if (!entityURI && status & MigrationItemStatus.INITIAL | MigrationItemStatus.QUEUED) {
      consola.info(`Importing ${migrationName}:${sourceID}`)
    } else if (entityURI && status & MigrationItemStatus.IMPORTED | MigrationItemStatus.QUEUED) {
      consola.info(`Updating ${migrationName}:${sourceID}`)
    }
  })

  nitro.hooks.hook(`migrate:rollback:item`, (item) => {
    const status = item.get(`status`)
    if (status & (MigrationItemStatus.IMPORTED | MigrationItemStatus.ERRORED | MigrationItemStatus.QUEUED)) {
      consola.info(`Rollback ${item.get(`migration.name`)}:${item.get(`sourceID`)}`)
    }
  })
})
