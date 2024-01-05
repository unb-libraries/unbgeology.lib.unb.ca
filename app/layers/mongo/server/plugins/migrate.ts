import { readFile } from "fs/promises"
import { MigrationStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook(`migrate`, async (migrationID: string) => {
    const migration = await Migration
      .findById(migrationID)
      .populate(`source`)

    if (!migration) {
      throw createError(`No migration with ID ${migrationID} found.`)
    }

    migration.status = MigrationStatus.RUNNING
    await migration.save()

    const json = await readFile(migration.source.filepath, { encoding: `utf8` })
    const items = JSON.parse(json)

    await Promise.all(items.map(async (item: any) => {
      const { id: sourceID, ...data } = item
      const migrationItem = await MigrationItem.create({
        sourceID,
        item: JSON.stringify(data),
        migration,
      })

      async function success(item: any) {
        const { baseURI: uri } = useAppConfig().entityTypes[migration.entityType]
        const { self } = await $fetch<{ self: string }>(uri, { method: `POST`, body: item })
        migrationItem.destinationID = self
        migrationItem.status = `imported`
        await migrationItem.save()
      }

      async function error(errorMessage: string) {
        migrationItem.error = errorMessage
        migrationItem.status = `failed`
        await migrationItem.save()
      }

      nitroApp.hooks.callHook(`migrate:item`, data, migration, { success, error })
    }))

    migration.status = MigrationStatus.SUCCEDED
    await migration.save()
  })
})
