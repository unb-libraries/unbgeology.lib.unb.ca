import { type Entity, MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"
import type { MigrateHandler } from "../../types"
import { type Migration } from "../documentTypes/Migration"
import { type MigrationItem } from "../documentTypes/MigrationItem"

enum MigrationLookupErrorReason {
  UNAVAILABLE = 1,
  SKIPPED = 2,
  ERRORED = 4,
}

interface MigrationLookupErrorDetails {
  item: MigrationItem
  reason: MigrationLookupErrorReason
}
export class MigrationLookupError extends Error {
  private _sourceID: string
  private _details: Partial<MigrationLookupErrorDetails>

  constructor(sourceID: string, details?: Partial<MigrationLookupErrorDetails>, message?: string) {
    super(message || details?.reason === MigrationLookupErrorReason.UNAVAILABLE
      ? `Item "${sourceID}" does not exist.`
      : details?.reason === MigrationLookupErrorReason.SKIPPED
        ? `Item "${sourceID}" not imported.`
        : details?.reason === MigrationLookupErrorReason.ERRORED
          ? `Item "${sourceID}" errored.`
          : ``,
    )
    this._sourceID = sourceID
    this._details = details || {}
  }

  get sourceID(): string {
    return this._sourceID
  }

  get item(): MigrationItem | undefined {
    return this._details?.item
  }

  get reason(): MigrationLookupErrorReason | undefined {
    return this._details?.reason
  }
}

export function getMigrationDependency(migration: Migration, entityType: string) {
  return migration.dependencies.find(d => d.entityType === entityType)
}

export function useMigrationLookup(migration: Migration, sourceID: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const registry: (() => void)[] = []
    const register = (unregister: () => void) => registry.push(unregister)
    const unregister = () => registry.forEach(unregister => unregister())

    const nitro = useNitroApp()

    function onImport(item: MigrationItem) {
      if (`${item.sourceID}` === sourceID && `${item.migration._id}` === `${migration._id}`) {
        unregister()
        resolve(item.entityURI!)
      }
    }

    function onSkip(item: MigrationItem) {
      if (`${item.sourceID}` === sourceID && `${item.migration._id}` === `${migration._id}`) {
        unregister()
        reject(new MigrationLookupError(sourceID, { item, reason: MigrationLookupErrorReason.SKIPPED }))
      }
    }

    function onError(item: MigrationItem, err: Error) {
      if (`${item.sourceID}` === sourceID && `${item.migration._id}` === `${migration._id}`) {
        unregister()
        reject(new MigrationLookupError(sourceID, { item, reason: MigrationLookupErrorReason.ERRORED }, err.message))
      }
    }

    nitro && [
      nitro.hooks.hook(`migrate:import:item:imported`, onImport),
      nitro.hooks.hook(`migrate:import:item:error`, onError),
      nitro.hooks.hook(`migrate:import:item:skipped`, onSkip),
    ].forEach(register)

    MigrationItem.mongoose.model.findOne({ migration: migration._id, sourceID })
      .then((item) => {
        const status = item?.get(`status`)
        unregister()
        switch (status) {
          case MigrationItemStatus.INITIAL: onSkip(item!); break
          case MigrationItemStatus.IMPORTED: onImport(item!); break
          case MigrationItemStatus.ERRORED: onError(item!, new Error(item!.error)); break
          case MigrationItemStatus.QUEUED:
          case MigrationItemStatus.PENDING: nitro.hooks.callHook(`migrate:import:item:wait`, item!); break
          default: reject(new Error(`Item "${sourceID}" does not exist.`))
        }
      })
      .catch((err: Error) => {
        unregister()
        reject(new MigrationLookupError(sourceID, { reason: MigrationLookupErrorReason.UNAVAILABLE }, err.message))
      })
  })
}

export function defineMigrateHandler<T, E extends Entity = Entity>(entityType: string, handler: (data: T, item: MigrationItem) => E | null | Promise<E | null>): MigrateHandler {
  return defineNitroPlugin((nitro) => {
    // REFACTOR: This shall use an EntitJSON<MigrationItem>
    nitro.hooks.hook(`migrate:import:item:transform`, async (item) => {
      if (item.migration.entityType === entityType) {
        return await handler(item.data, item)
      }
      return {}
    })
  })
}

export async function migrateSkip(item: MigrationItem) {
  const nitro = useNitroApp()
  // await $fetch<EntityJSON<MigrationItem>>(item.self, {
  //   method: `PATCH`,
  //   body: { status: MigrationItemStatus.SKIPPED },
  // })

  if (nitro) {
    const updated = await MigrationItem.mongoose.model.findByIdAndUpdate(item._id, { status: MigrationItemStatus.SKIPPED }, { returnDocument: `after` })
    // const updated = await $fetch<EntityJSON<MigrationItem>>(item.self)
    nitro.hooks.callHook(`migrate:import:item:skipped`, updated)
    nitro.hooks.callHook(`migrate:import:item:done`, updated)
  }
}
