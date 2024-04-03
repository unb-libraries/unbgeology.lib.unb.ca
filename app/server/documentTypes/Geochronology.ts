import { EntityFieldTypes } from "layers/mongo/types/entity"
import { type Unit, Status, Division } from "types/geochronology"
import type { TaxonomyTerm } from "~/layers/mongo/server/documentTypes/TaxonomyTerm"

type GeochronologicUnit = Omit<Unit, keyof TaxonomyTerm> & TaxonomyTerm
const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

export default defineDocumentModel(`GeochronologicUnit`, defineDocumentSchema<GeochronologicUnit>({
  division: {
    type: EntityFieldTypes.String,
    enum: Division,
    required: true,
  },
  boundaries: {
    lower: {
      type: EntityFieldTypes.Number,
      required: true,
    },
    upper: {
      type: EntityFieldTypes.Number,
      required: true,
    },
  },
  gssp: {
    type: EntityFieldTypes.Boolean,
    default: false,
  },
  uncertainty: {
    type: EntityFieldTypes.Number,
    required: false,
    default: 0,
  },
  color: {
    type: EntityFieldTypes.String,
    required: false,
  },
}).mixin(State)())
