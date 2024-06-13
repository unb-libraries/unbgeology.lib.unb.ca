import type { Mineral } from "~/types/classification"
interface ClassificationData {
  name: string
  parent: string
  composition: string
}

export default defineMigrateHandler<ClassificationData, Mineral>(`Term`, async (item, { migration }) => {
  const { name: label, parent, composition } = item
  return {
    label,
    parent: (parseInt(parent) > 0 && await useMigrationLookup(migration, parent)) || undefined,
    composition: composition || undefined,
  }
})
