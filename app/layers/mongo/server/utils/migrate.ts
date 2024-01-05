import type { Migration } from "@unb-libraries/nuxt-layer-entity"
import type { EntityDocument } from "../../types/entity"

export async function useMigrationLookup(migration: EntityDocument<Migration>, sourceID: number): Promise<string | null> {
  const item = await MigrationItem.findOne({ migration, sourceID })
  if (item && item.destinationID) {
    return item.destinationID
  }
  return null
}
