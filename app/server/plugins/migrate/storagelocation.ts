import { type StorageLocation } from "~/types/storagelocation"

interface MStorageLocation {
  Label: string
  Parent: number
}

export default defineMigrateHandler<MStorageLocation, StorageLocation>(`Term.StorageLocation`, async (data, { migration }) => {
  const { Label: label, Parent: parent } = data
  return {
    label,
    parent: (parent && (await useMigrationLookup(migration, `${parent}`))) || undefined,
    type: `storageLocation`,
  }
})
