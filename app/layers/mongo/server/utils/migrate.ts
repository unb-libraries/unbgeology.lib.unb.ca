import type { Migration, Entity, EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"
import type { MigrateHandler } from "../../types"

export function getMigrationDependency(migration: Migration, entityType: string) {
  return migration.dependencies.find(d => d.entityType === entityType)
}

export async function useMigrationLookup(migration: Migration, sourceID: number): Promise<string | null> {
  const item = await MigrationItem.findOne({ migration, sourceID })
  if (item && item.entityURI) {
    return item.entityURI
  } else if (item) {
    return null
  } else {
    throw new Error(`No item found for migration "${migration.name}" and sourceID "${sourceID}"`)
  }
}

export function useMigrateHandler<T, E extends Entity = Entity>(entityType: string, handler: (data: T, lookups: Record<string, (sourceID: number) => ReturnType<typeof useMigrationLookup>>) => EntityJSONBody<E> | Promise<EntityJSONBody<E>>): MigrateHandler {
  return async (data, migration, { ready, skip, error }) => {
    const lookupMapper = (migration: Migration) => [migration.entityType, async (sourceID: number) => await useMigrationLookup(migration, sourceID)]
    const lookups = Object.fromEntries([lookupMapper(migration), ...migration.dependencies.map(lookupMapper)])

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
