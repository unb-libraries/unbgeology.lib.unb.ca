import { type Term as ITerm } from "~/layers/mongo/server/documentTypes/Term"
import { Hierarchical, type Hierarchical as IHierarchical } from "~/layers/mongo/server/utils/mixins"
import { EntityFieldTypes } from "~/layers/mongo/types/entity"
import type { DocumentSchema } from "~/layers/mongo/types/schema"
import {
  type Classification as IClassification,
  type Fossil as FossilCE,
  type Rock as RockCE,
  type Mineral as MineralCE,
  Rank,
  Status,
} from "~/types/classification"

type Classification<T extends IClassification = IClassification> = Omit<IClassification & IHierarchical & ITerm, `parent`> & {
  parent?: Classification<T>
} & T

const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

const MxAuthorize = <T extends IClassification>(type: string) => Authorize<Classification<T>>({
  paths: (classification: Classification<T>) => {
    const status = useEnum(Status).labelOf(classification.status).toLowerCase()
    return [
      `term`,
      `term:${status}`,
      `term:classification`,
      `term:classification:${status}`,
      `term:classification:${classification.type}`,
      `term:classification:${type}:${status}`,
    ]
  },
})

const defineClassificationSchema = <T extends IClassification = IClassification>(type: string, definition: DocumentSchema<Classification<T>>[`paths`]) =>
  defineDocumentSchema<Classification<T>>(definition)
    .mixin(Hierarchical<ITerm & IClassification>({ sort: `label` }))
    .mixin(State)
    .mixin(MxAuthorize<T>(type))

export type Fossil = Classification<FossilCE>
export type Rock = Classification<RockCE>
export type Mineral = Classification<MineralCE>

export default {
  Fossil: defineDocumentModel(`CFossil`, defineClassificationSchema<FossilCE>(`fossil`, {
    rank: {
      type: EntityFieldTypes.Mixed,
      required: true,
      enum: Rank,
    },
  })(), Term),

  Rock: defineDocumentModel(`CRock`, defineClassificationSchema<RockCE>(`rock`, {
  })(), Term),

  Mineral: defineDocumentModel(`CMineral`, defineClassificationSchema<MineralCE>(`mineral`, {
    composition: {
      type: EntityFieldTypes.String,
      required: false,
    },
  })(), Term),
}
