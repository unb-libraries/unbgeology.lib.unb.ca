import { type Entity, type Migration as MigrationEntity, MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes } from "../../types/entity"
import { type DocumentBase as IDocumentBase } from "../../types/schema"
import type { File } from "./FileBase"

export interface Migration extends Omit<MigrationEntity, keyof Entity | `source` | `dependencies`>, IDocumentBase {
  source: File[]
  dependencies: Migration[]
}

export default defineDocumentModel(`Migration`, defineDocumentSchema<Migration>({
  name: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
  },
  entityType: {
    type: EntityFieldTypes.String,
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
    required: true,
    default: 0,
  },
}).mixin(Stateful({
  values: MigrationStatus,
  default: MigrationStatus.IDLE,
})).mixin(DocumentBase())())
