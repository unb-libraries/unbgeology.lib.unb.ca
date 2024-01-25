import { defu } from "defu"
import { MigrationStatus, type Migration, type MigrationItem, type EntityJSON, Status } from "@unb-libraries/nuxt-layer-entity"
import { type SourceItem } from "../../types/migrate"
import { type MigrateOptions } from "../../types"

export default defineNitroPlugin((nitroApp) => {
  // REFACTOR "migrate:init" hook to be implemented as nitro task (once feature becomes available)
  nitroApp.hooks.hook(`migrate:init`, async (migration: Migration, items: SourceItem[]) => {
    await Promise.all(items.map(async (item) => {
      const { id: sourceID, ...data } = item
      if (!sourceID) {
        throw new Error(`Invalid source. No "id" found.`)
      }

      await MigrationItem.findOneAndUpdate({ sourceID, migration }, { $set: { sourceID, migration }, $push: { data } }, { upsert: true })
    }))

    const total = await MigrationItem.find({ migration }).count()
    await Migration.updateOne({ _id: migration }, { total })
  })

  // REFACTOR "migrate:import" hook to be implemented as nitro task (once feature becomes available)
  nitroApp.hooks.hook(`migrate:import`, async (migration: Migration, config?: MigrateOptions) => {
    const options = defu(config ?? {}, { chunkSize: 20 })

    if (migration.status !== MigrationStatus.RUNNING) {
      migration.status = MigrationStatus.RUNNING
      await migration.save()
    }

    let pendingCount = 0
    function start() {
      pendingCount++
    }

    function done() {
      if (--pendingCount === 0) {
        nitroApp.hooks.callHook(`migrate:import`, migration)
      }
    }

    const items = await MigrationItem
      .find({ migration, status: MigrationStatus.QUEUED })
      .sort(`sourceID`)
      .populate({ path: `migration`, populate: { path: `dependencies` } })
      .limit(options.chunkSize)

    items.forEach((item) => {
      async function ready(data: any) {
        const { baseURI: uri } = useAppConfig().entityTypes[item.migration.entityType]

        try {
          const entity = await $fetch<EntityJSON>(uri, { method: `POST`, body: { status: Status.IMPORTED, ...data } })
          const updatedItem = await MigrationItem.findOneAndUpdate(
            { _id: item.id },
            { entityURI: entity.self, status: MigrationStatus.IMPORTED }, { new: true })
          await updatedItem.populate(`migration`)
          nitroApp.hooks.callHook(`migrate:import:item:imported`, updatedItem, entity)
          nitroApp.hooks.callHook(`migrate:import:item:done`, updatedItem, entity)
          done()
        } catch (err: any) {
          error((err as Error).message)
        }
      }

      async function skip() {
        const updatedItem = await MigrationItem.findOneAndUpdate(
          { _id: item.id },
          { status: MigrationStatus.SKIPPED }, { new: true })
        await updatedItem.populate(`migration`)
        nitroApp.hooks.callHook(`migrate:import:item:skipped`, item)
        nitroApp.hooks.callHook(`migrate:import:item:done`, item)
        done()
      }

      async function error(errorMessage: string) {
        const updatedItem = await MigrationItem.findOneAndUpdate(
          { _id: item.id },
          { error: errorMessage, status: MigrationStatus.ERRORED })
        await updatedItem.populate(`migration`)
        nitroApp.hooks.callHook(`migrate:import:item:error`, item, errorMessage)
        nitroApp.hooks.callHook(`migrate:import:item:done`, item, null, errorMessage)
        done()
      }

      item.status = MigrationStatus.PENDING
      item.save()
      start()
      nitroApp.hooks.callHook(`migrate:import:item`, defu(...item.data), item.migration, { ready, error, skip })
    })
  })

  nitroApp.hooks.hook(`migrate:import:item:imported`, async (item) => {
    await Migration.findOneAndUpdate({ _id: item.migration }, { $inc: { imported: 1 } }, { new: true })
  })

  nitroApp.hooks.hook(`migrate:import:item:error`, async (item) => {
    await Migration.findOneAndUpdate({ _id: item.migration }, { $inc: { errored: 1 } }, { new: true })
  })

  nitroApp.hooks.hook(`migrate:import:item:skipped`, async (item) => {
    await Migration.findOneAndUpdate({ _id: item.migration }, { $inc: { skipped: 1 } }, { new: true })
  })

  nitroApp.hooks.hook(`migrate:import:item:done`, async (item) => {
    const pendingCount = await MigrationItem
      .where(`migration`).equals(item.migration)
      .where(`status`).in([MigrationStatus.QUEUED, MigrationStatus.PENDING])
      .countDocuments()
    if (pendingCount === 0) {
      await Migration.updateOne({ _id: item.migration }, { status: MigrationStatus.IDLE })
    }
  })

  // REFACTOR "migrate:rollback" hook to be implemented as nitro task (once feature becomes available)
  nitroApp.hooks.hook(`migrate:rollback`, async (migration) => {
    await Migration.updateOne({ _id: migration }, { status: MigrationStatus.RUNNING })
    const items = await MigrationItem
      .find({ migration })
      .select(`_id entityURI`)

    await Promise.all(items.map(async item => item.entityURI ? await $fetch(item.entityURI, { method: `DELETE` }) : null))
    await MigrationItem.updateMany({ migration }, { $set: { status: MigrationStatus.INITIAL }, $unset: { entityURI: 1, error: 1 } })
    await Migration.updateOne({ _id: migration }, { imported: 0, errored: 0, skipped: 0, status: MigrationStatus.IDLE })
  })
})
