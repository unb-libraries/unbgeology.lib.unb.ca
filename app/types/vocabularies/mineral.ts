import { type TaxonomyTerm, type Term } from "@unb-libraries/nuxt-layer-entity"

export interface Classification extends TaxonomyTerm {
  composition: string[]
}

export interface Portion extends Term {
}
