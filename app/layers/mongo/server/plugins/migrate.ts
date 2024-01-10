import { MigrationStatus, type Migration, type MigrationItem } from "@unb-libraries/nuxt-layer-entity"
import { type SourceItem } from "../../types/migrate"

export default defineNitroPlugin((nitroApp) => {
  // REFACTOR "migrate:init" hook to be implemented as nitro task (once feature becomes available)
  nitroApp.hooks.hook(`migrate:init`, async (migration: Migration, items: SourceItem[]) => {
    await Promise.all(items.map(async (item) => {
      const { id: sourceID, ...data } = item
      return await MigrationItem.create({
        sourceID,
        migration: migration.id,
        data,
      })
    }))
  })

  // REFACTOR "migrate:import" hook to be implemented as nitro task (once feature becomes available)
  nitroApp.hooks.hook(`migrate:import`, async (items: MigrationItem[]) => {
    const migrationIDs = items.map(item => item.migration.id).filter((id, index, arr) => arr.indexOf(id) === index)
    await Migration.updateMany({ _id: migrationIDs }, { status: MigrationStatus.RUNNING })

    items.forEach((item) => {
      async function ready(data: any) {
        const { baseURI: uri } = useAppConfig().entityTypes[item.migration.entityType]

        const { self } = await $fetch<{ self: string }>(uri, { method: `POST`, body: data })
        await MigrationItem.updateOne({ _id: item.id }, { entityURI: self, status: `imported` })

        const dependantIDs = (await MigrationItem.find({ requires: item.id })).map(item => item.id)
        await MigrationItem.updateMany({ requires: item.id }, { $pull: { requires: item.id } })
        const dependants = await MigrationItem
          .find({ _id: { $in: dependantIDs } })
          .populate(`migration`)

        nitroApp.hooks.callHook(`migrate:import`, dependants)
      }

      async function require(sourceID: number, migration: Migration) {
        const dependency = await MigrationItem.findOne({ migration, sourceID })
        await MigrationItem.updateOne({ _id: item.id }, { $push: { requires: dependency }, $set: { status: `waiting` } })
      }

      async function error(errorMessage: string) {
        await MigrationItem.updateOne({ _id: item.id }, { error: errorMessage, status: `failed` })
      }

      nitroApp.hooks.callHook(`migrate:import:item`, item.data, item.migration, { ready, require, error })
    })
  })
  })
})
