import { defu } from "defu"
import { MigrationStatus, type Migration, type MigrationItem, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import { type SourceItem } from "../../types/migrate"

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
  nitroApp.hooks.hook(`migrate:import`, async (items: MigrationItem[]) => {
    const migrationIDs = items.map(item => item.migration.id).filter((id, index, arr) => arr.indexOf(id) === index)
    await Migration.updateMany({ _id: migrationIDs }, { status: MigrationStatus.RUNNING })

    items.forEach((item) => {
      async function ready(data: any) {
        const { baseURI: uri } = useAppConfig().entityTypes[item.migration.entityType]

        try {
          const entity = await $fetch<EntityJSON>(uri, { method: `POST`, body: data })
          const updatedItem = await MigrationItem.findOneAndUpdate(
            { _id: item.id },
            { entityURI: entity.self, status: MigrationStatus.IMPORTED }, { new: true })
          await updatedItem.populate(`migration`)
          nitroApp.hooks.callHook(`migrate:import:item:imported`, updatedItem, entity)
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
      }

      async function error(errorMessage: string) {
        const updatedItem = await MigrationItem.findOneAndUpdate(
          { _id: item.id },
          { error: errorMessage, status: MigrationStatus.ERRORED })
        await updatedItem.populate(`migration`)
        nitroApp.hooks.callHook(`migrate:import:item:error`, item, errorMessage)
      }

      nitroApp.hooks.callHook(`migrate:import:item`, defu(...item.data), item.migration, { ready, error, skip })
    })
  })

  nitroApp.hooks.hook(`migrate:import:item:imported`, async (item, entity) => {
    const { _id, total, imported, skipped, errored } = await Migration
      .findOneAndUpdate({ _id: item.migration }, { $inc: { imported: 1 } }, { new: true })
    if (total === imported + skipped + errored) {
      await Migration.updateOne({ _id }, { status: MigrationStatus.IDLE })
    }
  })

  nitroApp.hooks.hook(`migrate:import:item:error`, async (item, error) => {
    const { _id, total, imported, skipped, errored } = await Migration
      .findOneAndUpdate({ _id: item.migration }, { $inc: { errored: 1 } }, { new: true })
    if (total === imported + skipped + errored) {
      await Migration.updateOne({ _id }, { status: MigrationStatus.IDLE })
    }
  })

  nitroApp.hooks.hook(`migrate:import:item:skipped`, async (item) => {
    const { _id, total, imported, skipped, errored } = await Migration
      .findOneAndUpdate({ _id: item.migration }, { $inc: { skipped: 1 } }, { new: true })
    if (total === imported + skipped + errored) {
      await Migration.updateOne({ _id }, { status: MigrationStatus.IDLE })
    }
  })

  // REFACTOR "migrate:rollback" hook to be implemented as nitro task (once feature becomes available)
  nitroApp.hooks.hook(`migrate:rollback`, async (items) => {
    const itemIDs = items.map(item => item.id)
    await Promise.all(items.map(async (item) => {
      if (item.status === MigrationStatus.IMPORTED) {
        await Migration.updateOne({ _id: item.migration }, { $inc: { imported: -1 } })
        if (item.entityURI) {
          await $fetch(item.entityURI, { method: `DELETE` })
        }
      } else if (item.status === MigrationStatus.SKIPPED) {
        await Migration.updateOne({ _id: item.migration }, { $inc: { skipped: -1 } })
      } else if (item.status === MigrationStatus.ERRORED) {
        await Migration.updateOne({ _id: item.migration }, { $inc: { errored: -1 } })
      }
    }))

    await MigrationItem.updateMany(
      { _id: { $in: itemIDs } },
      {
        $set: { status: MigrationStatus.INITIAL },
        $unset: { requires: 1, entityURI: 1, error: 1 },
      })
  })
})
