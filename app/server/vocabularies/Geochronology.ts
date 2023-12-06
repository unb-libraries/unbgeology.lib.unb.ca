import { type GeochronologicUnit, Division } from "types/vocabularies"
import { type EntityDocument, EntityFieldTypes } from "layers/mongo/types/entity"

export default defineTaxonomy<EntityDocument<GeochronologicUnit>>(`Geochronology`, {
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
})
