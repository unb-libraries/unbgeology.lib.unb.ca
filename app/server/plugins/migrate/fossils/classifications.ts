import { type Fossil, Rank } from "~/types/classification"

interface ClassificationItem {
  Name: string
  Parent: string
  Rank: string
}

export default defineMigrateHandler<ClassificationItem, Fossil>(`Term.Classification.Fossil`, async (item, { migration }) => {
  const { Name: label, Parent: parent, Rank: rank } = item

  return {
    label,
    parent: (parent && (await useMigrationLookup(migration, parent))) || undefined,
    rank: ((rank: string) => {
      switch (rank) {
        case `Domain`: return Rank.DOMAIN
        case `Kingdom`: return Rank.KINGDOM
        case `Phylum`: return Rank.PHYLUM
        case `Subphylum`: return Rank.SUBPHYLUM
        case `Class`: return Rank.CLASS
        case `Subclass`: return Rank.SUBCLASS
        case `Orders`: return Rank.ORDERS
      }
    })(rank),
    type: `classification/fossil`,
  }
})
