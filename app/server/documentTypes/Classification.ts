import { type Term as ITerm, renderTerm } from "~/server/documentTypes/Term"
import type { Image } from "~/server/documentTypes/Image"
import { Hierarchical } from "~/server/utils/mixins"
import { renderHierarchical } from "~/server/utils/mixins/Hierarchical"
import { EntityFieldTypes } from "~/types/entity"
import type { DocumentSchema } from "~/types/schema"
import {
  type Classification as IClassification,
  type Fossil as FossilCE,
  type Rock as RockCE,
  type Mineral as MineralCE,
  Rank,
  Status,
} from "~/types/classification"

export type Classification<T extends IClassification = IClassification> = ITerm & Omit<T, "image"> & {
  image: Image
}

const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

export function renderClassification(doc: Classification) {
  return {
    ...renderTerm(doc),
    ...renderHierarchical(doc, renderClassification),
    self: `/api/terms/classifications/${doc._id}`,
    description: doc.description,
    image: doc.image && renderImageFile(doc.image),
    rank: doc.rank && useEnum(Rank).labelOf(doc.rank).toLowerCase(),
    composition: doc.type === `Term.CMineral` ? doc.composition : undefined,
    type: doc.type && `classification/${doc.type.split(`.`).at(-1).slice(1).toLowerCase()}`,
    children: {
      self: `/api/terms/classifications/${doc._id}/children`,
    },
  }
}

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
  defineDocumentSchema<Classification<T>>({
      ...definition,
      description: {
        type: EntityFieldTypes.String,
        required: false,
      },
      image: {
        type: EntityFieldTypes.ObjectId,
        ref: `File.Image`,
        required: false,
      },
    })
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
