import { type MigrationItem as MigrationItemEntity, type Entity, MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes } from "../../types/entity"
import type { DocumentBase as IDocumentBase } from "../../types/schema"
import type { Migration as IMigration } from "./Migration"

export interface MigrationItem extends Omit<MigrationItemEntity, keyof Entity | `migration`>, IDocumentBase {
  migration: IMigration
}

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
    ref: `Migration`,
    required: true,
  },
  error: {
    type: EntityFieldTypes.String,
    required: false,
  },
  status: {
    type: EntityFieldTypes.Number,
    enum: MigrationItemStatus,
    default: MigrationItemStatus.INITIAL,
  },
}, {
  alterSchema(schema) {
    schema.pre(`save`, function (next) {
      this.$locals.isNew = this.isNew
      next()
    })
    schema.post(`save`, async function () {
      if (this.$locals.isNew) {
        await Migration.mongoose.model.updateOne({ _id: this.migration }, { $inc: { total: 1 } })
      }
    })
    schema.post(`deleteOne`, { document: true, query: false }, async function () {
      await Migration.mongoose.model.updateOne({ _id: this.migration }, { $inc: { total: -1 } })
    })
  },
}).mixin(Stateful({
  values: MigrationItemStatus,
  default: MigrationItemStatus.INITIAL,
})).mixin(DocumentBase())())
