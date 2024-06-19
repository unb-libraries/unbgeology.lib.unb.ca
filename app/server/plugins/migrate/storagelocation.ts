import { type StorageLocation } from "~/types/storagelocation"

interface MStorageLocation {
  name: string
  parent_id: number
}

export default defineMigrateHandler<MStorageLocation, StorageLocation>(`Term.StorageLocation`, async (data, { migration }) => {
  const { name: label, parent_id: parent } = data
  return {
    label,
    parent: (parent > 0 && (await useMigrationLookup(migration, `${parent}`))) || undefined,
    type: `storageLocation`,
  }
})
