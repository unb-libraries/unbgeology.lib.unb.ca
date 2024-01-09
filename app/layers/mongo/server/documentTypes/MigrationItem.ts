import { type MigrationItem } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes, type EntityDocument } from "../../types/entity"

export default defineDocumentType<EntityDocument<MigrationItem>>(`MigrationItem`, {
  sourceID: {
    type: EntityFieldTypes.Number,
    required: true,
  },
  destinationID: {
    type: EntityFieldTypes.String,
    required: false,
  },
  data: {
    type: EntityFieldTypes.Mixed,
    required: true,
  },
  migration: {
    type: EntityFieldTypes.ObjectId,
    ref: Migration,
    required: true,
  },
  dependants: [{
    type: EntityFieldTypes.ObjectId,
    ref: `MigrationItem`,
  }],
  error: {
    type: EntityFieldTypes.String,
    required: false,
  },
  status: {
    type: EntityFieldTypes.String,
    enum: [`created`, `waiting`, `imported`, `failed`],
    default: `created`,
  },
})
