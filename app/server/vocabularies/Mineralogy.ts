import { type Classification, type Portion } from "types/vocabularies/mineral"
import { EntityFieldTypes } from "~/layers/mongo/types/entity"

export default {
  Classification: defineTaxonomy<Classification>(`Classification`, {
    composition: [{
      type: EntityFieldTypes.String,
    }],
  }, { domain: `Mineral` }),
  Portion: defineTermList<Portion>(`Portion`, {}, { domain: `Mineral` }),
}
