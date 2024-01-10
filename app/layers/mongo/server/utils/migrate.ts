import type { Migration } from "@unb-libraries/nuxt-layer-entity"

export async function useMigrationLookup(migration: Migration, sourceID: number): Promise<string | null> {
  const item = await MigrationItem.findOne({ migration, sourceID })
  if (item && item.entityURI) {
    return item.entityURI
  } else if (item) {
    return null
  } else {
    throw new Error(`No item found for migration "${migration.id}" and sourceID "${sourceID}"`)
  }
}
