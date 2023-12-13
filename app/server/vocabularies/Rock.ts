import { type Classification, type Portion } from "types/vocabularies/rock"

export default {
  Classification: defineTaxonomy<Classification>(`Classification`, {}, { domain: `Rock` }),
  Portion: defineTermList<Portion>(`Portion`, {}, { domain: `Rock` }),
}
