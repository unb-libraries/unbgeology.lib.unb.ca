import { EntityFieldTypes } from "~~/types/entity"
import { SpecimenStatus, type Specimen } from "~~/types/specimen"

export default defineEntityType<Specimen>(`Specimen`, {
  objectId: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
  },
  name: {
    type: EntityFieldTypes.String,
    required: true,
  },
  description: {
    type: EntityFieldTypes.String,
    required: false,
  },
  dimension: {
    width: {
      type: EntityFieldTypes.Number,
      required: false,
    },
    length: {
      type: EntityFieldTypes.Number,
      required: false,
    },
  },
  date: {
    type: EntityFieldTypes.Date,
    required: false,
  },
  age: {
    type: EntityFieldTypes.String,
    required: false,
  },
  pieces: {
    type: EntityFieldTypes.Number,
    required: false,
  },
  partial: {
    type: EntityFieldTypes.Boolean,
    required: false,
  },
  composition: {
    type: EntityFieldTypes.String,
    required: false,
  },
  status: {
    type: EntityFieldTypes.String,
    required: true,
    enum: SpecimenStatus,
    default: SpecimenStatus.DRAFT,
  },
})
