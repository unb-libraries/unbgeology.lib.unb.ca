import { type MigrationItem as MigrationItemEntity, MigrationStatus, type Entity } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes } from "../../types/entity"
import type { DocumentBase } from "../../types/schema"

interface MigrationItem extends Omit<MigrationItemEntity, keyof Entity>, DocumentBase {}

export default defineDocumentModel<MigrationItem>(`MigrationItem`, defineDocumentSchema<MigrationItem>({
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
    ref: Migration.mongoose.model.modelName,
    required: true,
  },
  error: {
    type: EntityFieldTypes.String,
    required: false,
  },
  status: {
    type: EntityFieldTypes.Number,
    enum: [MigrationStatus.INITIAL, MigrationStatus.QUEUED, MigrationStatus.PENDING, MigrationStatus.IMPORTED, MigrationStatus.SKIPPED, MigrationStatus.ERRORED],
    default: MigrationStatus.INITIAL,
  },
})())
