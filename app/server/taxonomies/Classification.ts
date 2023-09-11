import { type Taxonomy } from "entity-types/Taxonomy"

export interface Classification extends Taxonomy {
}

export default defineTaxonomyType<Classification>(`Classification`)
