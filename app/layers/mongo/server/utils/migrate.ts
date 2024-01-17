import type { Migration, Entity, EntityJSONBody, MigrationItem as IMigrationItem } from "@unb-libraries/nuxt-layer-entity"
import MigrationItem from "../documentTypes/MigrationItem"
import type { MigrateHandler } from "../../types"

export function getMigrationDependency(migration: Migration, entityType: string) {
  return migration.dependencies.find(d => d.entityType === entityType)
}

export function useMigrationLookup(migration: Migration, sourceID: number): Promise<string | null> {
  return new Promise<string>((resolve, reject) => {
    MigrationItem
      .findOne({ migration, sourceID })
      .exec()
      .then((item: IMigrationItem) => {
        if (item && item.entityURI) {
          resolve(item.entityURI)
        } else if (!item) {
          reject(new Error(`Item ${sourceID} does not exist.`))
        } else {
          useNitroApp().hooks.hook(`migrate:import:item:imported`, (item) => {
            if (item.sourceID === sourceID && item.migration.id === migration.id) {
              resolve(item.entityURI!)
            }
          })
          useNitroApp().hooks.hook(`migrate:import:item:error`, (item) => {
            if (item.sourceID === sourceID && item.migration.id === migration.id) {
              reject(new Error(`Item ${sourceID} errored during migration.`))
            }
          })
          useNitroApp().hooks.hook(`migrate:import:item:skipped`, (item) => {
            if (item.sourceID === sourceID && item.migration.id === migration.id) {
              reject(new Error(`Item ${sourceID} was skipped during migration.`))
            }
          })
        }
      })
  })
}

export function useMigrateHandler<T, E extends Entity = Entity>(entityType: string, handler: (data: T, lookups: Record<string, (sourceID: number) => ReturnType<typeof useMigrationLookup>>) => EntityJSONBody<E> | Promise<EntityJSONBody<E>>): MigrateHandler {
  return async (data, migration, { ready, skip, error }) => {
    const lookupMapper = (migration: Migration) => [migration.entityType, async (sourceID: number) => {
      try {
        return await useMigrationLookup(migration, sourceID)
      } catch (err: any) {
        throw new Error(`Lookup of item ${sourceID} failed: ${(err as Error).message}`)
      }
    }]

    const lookups = Object.fromEntries([
      lookupMapper(migration),
      ...migration.dependencies.map(lookupMapper),
    ])

    if (migration.entityType === entityType) {
      try {
        const body = await handler(data, lookups)
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
