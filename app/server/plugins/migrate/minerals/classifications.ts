import type { EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"
import type { Classification } from "~/types/vocabularies/mineral"

interface ClassificationData {
  name: string
  parent: string
  composition: string
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook(`migrate:import:item`, useMigrateHandler<ClassificationData, Classification>(`Mineral.Classification`, async (item, { sourceID: sourceIDLookup }) => {
    const { name: label, parent, composition } = item

    const body: EntityJSONBody<Classification> = { label, composition: [] }
    if (composition) {
      body.composition = [composition]
    }

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
