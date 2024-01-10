import { type Migration, MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import { type EntityDocument, EntityFieldTypes } from "../../types/entity"

export default defineDocumentType<EntityDocument<Migration>>(`Migration`, {
  name: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
  },
  entityType: {
    type: EntityFieldTypes.String,
    enum: Object.keys(useAppConfig().entityTypes),
    required: true,
  },
  source: {
    type: EntityFieldTypes.ObjectId,
    ref: FileBase,
    required: true,
  },
  total: {
    type: EntityFieldTypes.Number,
    min: 0,
    required: true,
  },
  imported: {
    type: EntityFieldTypes.Number,
    min: 0,
    required: true,
    default: 0,
  },
  skipped: {
    type: EntityFieldTypes.Number,
    min: 0,
    required: true,
    default: 0,
  },
  errored: {
    type: EntityFieldTypes.Number,
    min: 0,
    required: 0,
    default: 0,
  },
  status: {
    type: EntityFieldTypes.Number,
    enum: [MigrationStatus.IDLE, MigrationStatus.RUNNING],
    default: MigrationStatus.IDLE,
  },
})
