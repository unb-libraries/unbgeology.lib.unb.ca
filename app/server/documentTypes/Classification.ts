import { type TaxonomyTerm } from "~/layers/mongo/server/documentTypes/TaxonomyTerm"
import { EntityFieldTypes } from "~/layers/mongo/types/entity"
import {
  type FossilClassification as FossilCE,
  type RockClassification as RockCE,
  type MineralClassification as MineralCE,
  Rank,
  Status,
} from "~/types/classification"

type Classification<T> = Omit<T, keyof TaxonomyTerm> & TaxonomyTerm
const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

export default {
  Fossil: defineDocumentModel(`CFossil`, defineDocumentSchema<Classification<FossilCE>>({
    rank: {
      type: EntityFieldTypes.Mixed,
      required: true,
      enum: Rank,
    },
  }).mixin(State)(), TaxonomyTerm),

  Rock: defineDocumentModel(`CRock`, defineDocumentSchema<Classification<RockCE>>({
  }).mixin(State)(), TaxonomyTerm),

  Mineral: defineDocumentModel(`CMineral`, defineDocumentSchema<Classification<MineralCE>>({
    composition: {
      type: EntityFieldTypes.String,
      required: false,
    },
  }).mixin(State)(), TaxonomyTerm),
}
