import { type Taxonomy } from "~/layers/mongo/types/taxonomy"

export interface Classification extends Taxonomy {
}

export default defineTaxonomyType<Classification>(`Classification`)
