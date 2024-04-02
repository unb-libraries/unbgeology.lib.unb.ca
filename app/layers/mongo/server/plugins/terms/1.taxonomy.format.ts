import type { TaxonomyTerm as TaxonomyTermEntity } from "@unb-libraries/nuxt-layer-entity"
import type { TaxonomyTerm as TaxonomyTermDocument } from "../../documentTypes/TaxonomyTerm"

export default defineEntityFormatter<TaxonomyTermEntity, TaxonomyTermDocument>(Term, (item, { event }) => {
  const { __type, type } = item
  return __type === TaxonomyTerm.fullName
    ? {
        type: type ? `taxonomy` : undefined,
      }
    : {}
})
