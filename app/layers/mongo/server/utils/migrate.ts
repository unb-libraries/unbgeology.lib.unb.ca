import { type Migration, type Entity, type EntityJSONBody, type MigrationItem as IMigrationItem, type EntityJSON, type Status, MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import MigrationItem from "../documentTypes/MigrationItem"
import type { MigrateHandler } from "../../types"
import type { EntityMatcher, LookupHandlers } from "../../types/migrate"

export function getMigrationDependency(migration: Migration, entityType: string) {
  return migration.dependencies.find(d => d.entityType === entityType)
}

export function useMigrationLookup(migration: Migration, sourceID: number): Promise<string>
export function useMigrationLookup<E extends Entity = Entity>(migration: Migration, matcher: EntityMatcher<E>): Promise<string>
export function useMigrationLookup<E extends Entity = Entity>(migration: Migration, sourceIDOrMatcher: number | EntityMatcher<E>): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const registry: (() => void)[] = []
    const register = (unregister: () => void) => registry.push(unregister)
    const unregister = () => registry.forEach(unregister => unregister())

    if (typeof sourceIDOrMatcher === `number`) {
      const sourceID = sourceIDOrMatcher
      MigrationItem
        .findOne({ migration, sourceID })
        .exec()
        .then((item: IMigrationItem | null) => {
          if (item && item.entityURI) {
            unregister()
            resolve(item.entityURI)
          } else if (item && !item.entityURI && item.status === MigrationStatus.INITIAL) {
            unregister()
            reject(new Error(`Item ${sourceID} will not be imported.`))
          } else if (!item) {
            unregister()
            reject(new Error(`Item ${sourceID} does not exist.`))
          }
        })

      register(useNitroApp().hooks.hook(`migrate:import:item:imported`, (item) => {
        if (item.sourceID === sourceID && item.migration.id === migration.id) {
          unregister()
          resolve(item.entityURI!)
        }
      }))
      register(useNitroApp().hooks.hook(`migrate:import:item:error`, (item) => {
        if (item.sourceID === sourceID && item.migration.id === migration.id) {
          unregister()
          reject(new Error(`Item ${sourceID} errored during migration.`))
        }
      }))
      register(useNitroApp().hooks.hook(`migrate:import:item:skipped`, (item) => {
        if (item.sourceID === sourceID && item.migration.id === migration.id) {
          unregister()
          reject(new Error(`Item ${sourceID} was skipped during migration.`))
        }
      }))
    } else {
      const matcher = sourceIDOrMatcher
      MigrationItem.find({ migration, entityURI: { $exists: 1 } }).select(`entityURI`)
        .then((items) => {
          items.forEach(async (item) => {
            const entity = await $fetch<EntityJSON<E>>(item.entityURI)

            if (matcher(entity)) {
              unregister()
              resolve(entity.self)
            }
          })
        })

      register(useNitroApp().hooks.hook(`migrate:import:item:imported`, (item, entity) => {
        if (matcher(entity)) {
          unregister()
          resolve(entity.self)
        }
      }))
    }
  })
}

export function useMigrateHandler<T, E extends Entity = Entity>(entityType: string, handler: (data: T, lookups: LookupHandlers) => EntityJSONBody<Omit<E & { status: Status.IMPORTED }, `type`>> | null | Promise<EntityJSONBody<E> | null>): MigrateHandler {
  return async (data, migration, { ready, skip, error }) => {
    const sourceIDLookup = async (sourceID: number, entityType?: string) => {
      if (!entityType || entityType === migration.entityType) {
        return await useMigrationLookup(migration, sourceID)
      } else {
        const dependency = migration.dependencies.find(d => d.entityType === entityType)
        if (dependency) {
          return await useMigrationLookup(dependency, sourceID)
        }
      }
      throw new Error(`No ${entityType} migration available for lookup.`)
    }

    const entityLookup = async <M extends Entity = Entity>(matcher: EntityMatcher<M>, entityType?: string) => {
      if (!entityType || entityType === migration.entityType) {
        return await useMigrationLookup(migration, matcher)
      } else {
        const dependency = migration.dependencies.find(d => d.entityType === entityType)
        if (dependency) {
          return await useMigrationLookup(dependency, matcher)
        }
      }
      throw new Error(`No ${entityType} migration available for lookup.`)
    }

    if (migration.entityType === entityType) {
      try {
        const body = await handler(data, { sourceID: sourceIDLookup, entity: entityLookup })
        if (body) {
          ready(body)
        } else {
          skip()
        }
      } catch (err) {
        error((err as Error).message)
      }
    }
  }
}
