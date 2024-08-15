import { type Entity, type EntityJSONBody, type EntityJSON, type Status, MigrationStatus, MigrationItemStatus, type EntityJSONList } from "@unb-libraries/nuxt-layer-entity"
import type { MigrateHandler } from "../../types"
import type { EntityMatcher } from "../../types/migrate"
import { type Migration } from "../documentTypes/Migration"
import { type MigrationItem } from "../documentTypes/MigrationItem"

export class MigrationLookupError extends Error {
  private _sourceID: string
  private _item?: MigrationItem

  constructor(sourceID: string, message?: string, item?: MigrationItem) {
    super(message || `MigrationLookup error: ${sourceID}`)
    this._sourceID = sourceID
    this._item = item
  }

  get sourceID(): string {
    return this._sourceID
  }

  get item(): MigrationItem | undefined {
    return this._item
  }
}

export function getMigrationDependency(migration: Migration, entityType: string) {
  return migration.dependencies.find(d => d.entityType === entityType)
}

export function useMigrationLookup(migration: Migration, sourceID: string): Promise<string>
export function useMigrationLookup<E extends Entity = Entity>(migration: Migration, matcher: EntityMatcher<E>): Promise<string | null>
export function useMigrationLookup<E extends Entity = Entity>(migration: Migration, sourceIDOrMatcher: string | EntityMatcher<E>): Promise<string | null> {
  return new Promise<string | null>((resolve, reject) => {
    const registry: (() => void)[] = []
    const register = (unregister: () => void) => registry.push(unregister)
    const unregister = () => registry.forEach(unregister => unregister())

    const nitro = useNitroApp()

    if (typeof sourceIDOrMatcher === `string`) {
      const sourceID = sourceIDOrMatcher
      MigrationItem.mongoose.model.findOne({ migration: migration._id, sourceID })
        .then((item) => {
          if (item && item.entityURI) {
            unregister()
            resolve(item.entityURI)
          } else if (item && !item.entityURI && !((item.status as MigrationItemStatus) & (MigrationItemStatus.PENDING | MigrationItemStatus.QUEUED))) {
            unregister()
            reject(new MigrationLookupError(sourceID, `Item ${sourceID} will not be imported.`, item))
          } else if (item) {
            nitro.hooks.callHook(`migrate:import:item:wait`, item)
          } else if (!item) {
            unregister()
            reject(new MigrationLookupError(sourceID, `Item ${sourceID} does not exist.`))
          }
        })
        .catch((err: Error) => {
          unregister()
          reject(err)
        })

      if (nitro) {
        register(nitro.hooks.hook(`migrate:import:item:imported`, (item) => {
          if (`${item.sourceID}` === sourceID && `${item.migration._id}` === `${migration._id}`) {
            unregister()
            resolve(item.entityURI!)
          }
        }))
        register(nitro.hooks.hook(`migrate:import:item:error`, (item) => {
          if (`${item.sourceID}` === sourceID && `${item.migration._id}` === `${migration._id}`) {
            unregister()
            reject(new MigrationLookupError(sourceID, `Item ${sourceID} errored during migration.`, item))
          }
        }))
        register(nitro.hooks.hook(`migrate:import:item:skipped`, (item) => {
          if (`${item.sourceID}` === sourceID && `${item.migration._id}` === `${migration._id}`) {
            unregister()
            reject(new MigrationLookupError(sourceID, `Item ${sourceID} was skipped during migration.`, item))
          }
        }))
      }
    } else {
      const matcher = sourceIDOrMatcher
      MigrationItem.mongoose.model.find({ _id: migration._id, entityURI: { $regex: `(/[a-z0-9]+)+` } })
        .then(async (items) => {
          await Promise.all(items.map(async (item) => {
            function getAuthHeaders(): { Cookie?: string } {
              const event = useEvent()
              if (event) {
                const sessionName = useRuntimeConfig().public.session.name
                return { Cookie: `${sessionName}=${getCookie(event, sessionName)}` }
              }
              return {}
            }
            const entity = await $fetch<EntityJSON<E>>(item.entityURI!, { headers: getAuthHeaders() })
            if (matcher(entity)) {
              resolve(entity.self)
            }
          }))
          if (migration.status === MigrationStatus.IDLE) {
            resolve(null)
          }
        })
        .catch((err: Error) => {
          unregister()
          reject(err)
        })

      register(useNitroApp().hooks.hook(`migrate:import:item:imported`, async (item) => {
        // console.log(`dependency imported`)
        const entity = await $fetch<EntityJSON>(item.entityURI!)
        if (matcher(entity)) {
          unregister()
          resolve(entity.self)
        }
      }))
    }

    register(useNitroApp().hooks.hook(`migrate:pause`, (paused) => {
      // console.log(`migration paused`)
      if (`${paused._id}` === `${migration._id}`) {
        unregister()
        reject(new Error(`Migration ${migration._id} is paused.`))
      }
    }))
  })
}

export function defineMigrateHandler<T, E extends Entity = Entity>(entityType: string, handler: (data: Partial<T>, item: MigrationItem) => E | null | Promise<E | null>): MigrateHandler {
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
