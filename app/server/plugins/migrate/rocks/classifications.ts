import { type Rock } from "~/types/classification"

interface ClassificationItem {
  name: string
  parent: string
}

export default defineMigrateHandler<ClassificationItem, Rock>(`Term`, async (item, { migration }) => {
  const { name: label, parent } = item
  return {
    label,
    parent: (parseInt(parent) > 0 && await useMigrationLookup(migration, parent)) || undefined,
  }
})
