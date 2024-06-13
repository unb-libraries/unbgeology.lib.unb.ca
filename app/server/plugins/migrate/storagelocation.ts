import { type StorageLocation } from "~/types/storagelocation"

interface MStorageLocation {
  label: string
  parent: string
}

export default defineMigrateHandler<MStorageLocation, StorageLocation>(`Term`, async (data, { migration }) => {
  const { label, parent } = data
  return {
    label,
    parent: (parseInt(parent) > 0 && (await useMigrationLookup(migration, parent))) || undefined,
  }
})
