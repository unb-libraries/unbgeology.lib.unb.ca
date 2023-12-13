import { type Classification, type Portion } from "types/vocabularies/fossil"

export default {
  Classification: defineTaxonomy<Classification>(`Classification`, {}, { domain: `Fossil` }),
  Portion: defineTermList<Portion>(`Portion`, {}, { domain: `Fossil` }),
}
