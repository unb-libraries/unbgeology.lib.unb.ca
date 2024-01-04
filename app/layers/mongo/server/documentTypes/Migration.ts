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
  status: {
    type: EntityFieldTypes.String,
    enum: MigrationStatus,
    default: MigrationStatus.CREATED,
  },
})
