import { type Rock } from "~/types/classification"

interface ClassificationItem {
  Name: string
  Parent: string
}

export default defineMigrateHandler<ClassificationItem, Rock>(`Term.Classification.Rock`, async (item, { migration }) => {
  const { Name: label, Parent: parent } = item
  return {
    label,
    parent: (parseInt(parent) > 0 && await useMigrationLookup(migration, parent)) || undefined,
    type: `classification/rock`,
  }
})
