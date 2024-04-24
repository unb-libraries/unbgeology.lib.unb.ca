import { type Migration, type Entity, type EntityJSONBody, type MigrationItem as IMigrationItem, type EntityJSON, type Status, MigrationStatus, MigrationItemStatus, type MigrationItem, type EntityJSONList } from "@unb-libraries/nuxt-layer-entity"
import type { MigrateHandler } from "../../types"
import type { EntityMatcher } from "../../types/migrate"

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

    if (typeof sourceIDOrMatcher === `string`) {
      const sourceID = sourceIDOrMatcher
      $fetch<IMigrationItem>(`${migration.self}/items/${sourceID}`)
        .then((item) => {
          const status = useEnum(MigrationItemStatus).valueOf(item.status)
          if (item && item.entityURI) {
            unregister()
            resolve(item.entityURI)
          } else if (item && !item.entityURI && !(status & (MigrationItemStatus.PENDING | MigrationItemStatus.QUEUED))) {
            unregister()
            reject(new Error(`Item ${sourceID} will not be imported.`))
          } else if (!item) {
            unregister()
            reject(new Error(`Item ${sourceID} does not exist.`))
          }
        })
        .catch((err: Error) => {
          unregister()
          reject(err)
        })

      const nitro = useNitroApp()
      if (nitro) {
        register(nitro.hooks.hook(`migrate:import:item:imported`, (item) => {
          if (item.id === sourceID && item.migration.id === migration.id) {
            unregister()
            resolve(item.entityURI!)
          }
        }))
        register(nitro.hooks.hook(`migrate:import:item:error`, (item) => {
          if (item.id === sourceID && item.migration.id === migration.id) {
            unregister()
            reject(new Error(`Item ${sourceID} errored during migration.`))
          }
        }))
        register(nitro.hooks.hook(`migrate:import:item:skipped`, (item) => {
          if (item.id === sourceID && item.migration.id === migration.id) {
            unregister()
            reject(new Error(`Item ${sourceID} was skipped during migration.`))
          }
        }))
      }
    } else {
      const matcher = sourceIDOrMatcher
      $fetch<EntityJSONList<MigrationItem>>(`${migration.self}/items`, {
        query: {
          filter: [
            `migration:equals:${migration.id}`,
            `entityURI:match:(/[a-z0-9]+)+`,
          ],
        },
      }).then(async ({ entities: items }) => {
        await Promise.all(items.map(async (item) => {
          const entity = await $fetch<EntityJSON<E>>(item.entityURI!)
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
        const entity = await $fetch<EntityJSON>(item.entityURI!)
        if (matcher(entity)) {
          unregister()
          resolve(entity.self)
        }
      }))
    }

    register(useNitroApp().hooks.hook(`migrate:pause`, (paused) => {
      if (paused.id === migration.id) {
        unregister()
        reject(new Error(`Migration ${migration.id} is paused.`))
      }
    }))
  })
}

export function defineMigrateHandler<T, E extends Entity = Entity>(entityType: string, handler: (data: T, item: MigrationItem) => EntityJSONBody<E> | null | Promise<EntityJSONBody<E> | null>): MigrateHandler {
  return defineNitroPlugin((nitro) => {
    nitro.hooks.hook(`migrate:import:item`, async (item) => {
      if (item.migration.entityType === entityType) {
        return await handler(item.data, item)
      }
    })
  })
}

export async function migrateSkip(item: MigrationItem) {
  const nitro = useNitroApp()
  await $fetch<EntityJSON<MigrationItem>>(item.self, {
    method: `PATCH`,
    body: { status: MigrationItemStatus.SKIPPED },
  })

  if (nitro) {
    const updated = await $fetch<EntityJSON<MigrationItem>>(item.self)
    nitro.hooks.callHook(`migrate:import:item:skipped`, updated)
    nitro.hooks.callHook(`migrate:import:item:done`, updated)
  }
}
