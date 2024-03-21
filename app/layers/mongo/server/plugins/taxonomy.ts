import type { TaxonomyTerm as TaxonomyTermEntity } from "@unb-libraries/nuxt-layer-entity"
import TaxonomyTerm from "../documentTypes/TaxonomyTerm"
import type { TaxonomyTerm as TaxonomyTermDocument } from "../documentTypes/TaxonomyTerm"

export default defineEntityFormatter<TaxonomyTermEntity, TaxonomyTermDocument>(Term, (item) => {
  return item.type === TaxonomyTerm.fullName ? { type: `taxonomy` } : {}
})
