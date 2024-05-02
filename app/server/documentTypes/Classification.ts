import { type TaxonomyTerm as TaxonomyTermEntity } from "@unb-libraries/nuxt-layer-entity"
import { type TaxonomyTerm } from "~/layers/mongo/server/documentTypes/TaxonomyTerm"
import { EntityFieldTypes } from "~/layers/mongo/types/entity"
import {
  type FossilClassification as FossilCE,
  type RockClassification as RockCE,
  type MineralClassification as MineralCE,
  Rank,
  Status,
} from "~/types/classification"

type Classification<T> = Omit<T, keyof TaxonomyTermEntity> & TaxonomyTerm

const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

const MxAuthorize = <T>(type: string) => Authorize<Classification<T>>({
  paths: (classification: Classification<any>) => {
    const status = useEnum(Status).labelOf(classification.status).toLowerCase()
    return [
      `term`,
      `term:${status}`,
      `term:classification`,
      `term:classification:${status}`,
      `term:classification:${type}`,
      `term:classification:${type}:${status}`,
    ]
  },
})

export type Fossil = Classification<FossilCE>
export type Rock = Classification<RockCE>
export type Mineral = Classification<MineralCE>

export default {
  Fossil: defineDocumentModel(`CFossil`, defineDocumentSchema<Fossil>({
    rank: {
      type: EntityFieldTypes.Mixed,
      required: true,
      enum: Rank,
    },
  }).mixin(State)
    .mixin(MxAuthorize<Fossil>(`fossil`))(), TaxonomyTerm),

  Rock: defineDocumentModel(`CRock`, defineDocumentSchema<Rock>({
  }).mixin(State)
    .mixin(MxAuthorize<Rock>(`rock`))(), TaxonomyTerm),

  Mineral: defineDocumentModel(`CMineral`, defineDocumentSchema<Mineral>({
    composition: {
      type: EntityFieldTypes.String,
      required: false,
    },
  }).mixin(State)
    .mixin(MxAuthorize<Mineral>(`mineral`))(), TaxonomyTerm),
}
