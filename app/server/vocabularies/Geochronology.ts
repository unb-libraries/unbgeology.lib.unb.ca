import { type Unit, Division } from "types/vocabularies/geochronology"
import { type EntityDocument, EntityFieldTypes } from "layers/mongo/types/entity"

export default defineTaxonomy<EntityDocument<Unit>>(`Unit`, {
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
}, { domain: `Geochronology` })
