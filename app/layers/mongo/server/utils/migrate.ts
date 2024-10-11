import { type Entity, MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"
import type { MigrateHandler } from "../../types"
import type { Migration } from "../documentTypes/Migration"
import type { MigrationItem } from "../documentTypes/MigrationItem"

enum MigrationLookupErrorReason {
  UNAVAILABLE = 1,
  SKIPPED = 2,
  ERRORED = 4,
}

interface MigrationLookupErrorDetails {
  cause: MigrationLookupErrorReason
  message: string
}
export class MigrationLookupError extends Error {
  private _item?: MigrationItem

  constructor(item?: MigrationItem, options?: Partial<MigrationLookupErrorDetails>) {
    super(options?.message, { cause: options?.cause })
    this._item = item
  }

  get sourceID(): string | undefined {
    return this._item?.sourceID
  }
}

export class MigrationLookupNotFoundError extends MigrationLookupError {
  constructor(sourceID: string) {
    super(undefined, {
      message: `Item "${sourceID}" does not exist.`,
      cause: MigrationLookupErrorReason.UNAVAILABLE,
    })
  }
}

export class MigrationLookupNotImportedError extends MigrationLookupError {
  constructor(item: MigrationItem) {
    super(item, {
      message: `Item "${item.sourceID}" not imported.`,
      cause: MigrationLookupErrorReason.SKIPPED,
    })
  }
}

export class MigrationLookupNotSuccessful extends MigrationLookupError {
  constructor(item: MigrationItem) {
    super(item, {
      message: `Item "${item.sourceID}" errored.`,
      cause: MigrationLookupErrorReason.ERRORED,
    })
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
        reject(new MigrationLookupNotImportedError(item))
      }
    }

    function onError(item: MigrationItem, err: Error | string) {
      if (`${item.sourceID}` === sourceID && `${item.migration._id}` === `${migration._id}`) {
        unregister()
        reject(new MigrationLookupNotSuccessful(item))
      }
    }

    register(nitro?.hooks.hook(`migrate:import:item:imported`, onImport))
    register(nitro?.hooks.hook(`migrate:import:item:error`, onError))
    register(nitro?.hooks.hook(`migrate:import:item:skipped`, onSkip))

    MigrationItem.mongoose.model
      .findOne({ migration: migration._id, sourceID })
      .populate({ path: `migration`, populate: { path: `dependencies` } })
      .then((item) => {
        if (!item) {
          reject(new Error(`Item "${sourceID}" does not exist.`))
          return
        }

        const status = item.get(`status`)
        const { INITIAL, IMPORTED, ERRORED, QUEUED, PENDING } = MigrationItemStatus
        if (status === INITIAL) {
          onSkip(item)
        } else if (status === IMPORTED) {
          onImport(item)
        } else if (status === ERRORED) {
          onError(item, new Error(item.error))
        } else if (status & (QUEUED | PENDING)) {
          nitro?.hooks.callHook(`migrate:import:item:wait`, item)
        }
      })
      .catch(() => {
        unregister()
        reject(new MigrationLookupNotFoundError(sourceID))
      })
  })
}

export function defineMigrateHandler<T, E extends Entity = Entity>(entityType: string, handler: (data: T, item: MigrationItem) => E | null | Promise<E | null>): MigrateHandler {
  return defineNitroPlugin((nitro) => {
    // REFACTOR: This shall use an EntitJSON<MigrationItem>
    nitro.hooks.hook(`migrate:import:item:transform`, async (item, { fields }) => {
      if (item.migration.entityType === entityType) {
        const data = Object.fromEntries(Object.entries(item.data).filter(([key]) => fields?.includes(key) ?? true)) as T
        return await handler(data, item)
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
