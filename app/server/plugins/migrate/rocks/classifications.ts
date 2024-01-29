import { type TaxonomyTerm, type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"

interface ClassificationItem {
  name: string
  parent: string
}

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`migrate:import:item`, useMigrateHandler<ClassificationItem, TaxonomyTerm>(`Rock.Classification`, async (item, { sourceID: sourceIDLookup }) => {
    const { name: label, parent } = item

    const body: EntityJSONBody<TaxonomyTerm> = { label }
    const parentID = parseInt(parent)
    if (parentID > 0) {
      const parent = await sourceIDLookup(parentID)
      if (parent) {
        body.parent = parent
      }
    }

    return body
  }))
})
