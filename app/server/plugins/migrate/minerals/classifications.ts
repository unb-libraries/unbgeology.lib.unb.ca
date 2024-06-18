import type { Mineral } from "~/types/classification"
interface ClassificationData {
  Name: string
  Parent: string
  Composition: string
}

export default defineMigrateHandler<ClassificationData, Mineral>(`Term.Classification.Mineral`, async (item, { migration }) => {
  const { Name: label, Parent: parent, Composition: composition } = item
  return {
    label,
    type: `classification/mineral`,
    parent: (parseInt(parent) > 0 && await useMigrationLookup(migration, parent)) || undefined,
    composition: composition || undefined,
  }
})
