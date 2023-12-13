import { type Classification, type Portion } from "types/vocabularies/mineral"

export default {
  Classification: defineTaxonomy<Classification>(`Classification`, {}, { domain: `Mineral` }),
  Portion: defineTermList<Portion>(`Portion`, {}, { domain: `Mineral` }),
}
