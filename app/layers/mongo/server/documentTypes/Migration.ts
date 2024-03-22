import { type Entity, type Migration as MigrationEntity, MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes } from "../../types/entity"
import { type DocumentBase } from "../../types/schema"

interface Migration extends Omit<MigrationEntity, keyof Entity>, DocumentBase {

}

export default defineDocumentModel(`Migration`, defineDocumentSchema<Migration>({
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
  source: [{
    type: EntityFieldTypes.ObjectId,
    ref: FileBase,
    required: true,
  }],
  dependencies: [{
    type: EntityFieldTypes.ObjectId,
    ref: `Migration`,
  }],
  total: {
    type: EntityFieldTypes.Number,
    min: 0,
    required: true,
    default: 0,
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
})())
