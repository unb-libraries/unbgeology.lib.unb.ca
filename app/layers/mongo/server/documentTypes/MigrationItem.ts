import { type MigrationItem, MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes, type EntityDocument } from "../../types/entity"

export default defineDocumentType<EntityDocument<MigrationItem>>(`MigrationItem`, {
  sourceID: {
    type: EntityFieldTypes.Number,
    required: true,
  },
  entityURI: {
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
  error: {
    type: EntityFieldTypes.String,
    required: false,
  },
  status: {
    type: EntityFieldTypes.Number,
    enum: [MigrationStatus.INITIAL, MigrationStatus.PENDING, MigrationStatus.IMPORTED, MigrationStatus.SKIPPED, MigrationStatus.ERRORED],
    default: MigrationStatus.INITIAL,
  },
})
