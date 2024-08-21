import { type MigrationItem as MigrationItemEntity, type Entity, MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes } from "../../types/entity"
import type { DocumentBase as IDocumentBase } from "../../types/schema"
import { type Authorize as IAuthorize } from "../utils/mixins/Authorize"
import type { Migration as IMigration } from "./Migration"

export interface MigrationItem extends Omit<MigrationItemEntity, keyof Entity | `migration` | `status`>, IAuthorize, IDocumentBase {
  migration: IMigration
  status: MigrationItemStatus
}

export default defineDocumentModel<MigrationItem>(`MigrationItem`, defineDocumentSchema<MigrationItem>({
  sourceID: {
    type: EntityFieldTypes.String,
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
  queue: {
    type: EntityFieldTypes.String,
    required: false,
  },
  error: {
    type: EntityFieldTypes.String,
    required: false,
  },
  status: {
    type: EntityFieldTypes.Number,
    required: true,
    // TODO: Use enum
    min: 1,
    max: 31,
    default: MigrationItemStatus.INITIAL,
  },
}, {
  alterSchema(schema) {
    schema.pre(`save`, async function () {
      this.$locals.isNew = this.isNew

      // Validate status does not transition from IMPORTED to ERRORED or vice versa
      if (this.isNew) {
        const before = await MigrationItem.mongoose.model.findById(this._id)
        const { IMPORTED, ERRORED } = MigrationItemStatus
        if (before && ((before.status & IMPORTED && this.status & ERRORED) || (before.status & ERRORED && this.status & IMPORTED))) {
          const [beforeLabel, afterLabel] = [before, this].map(item => useEnum(MigrationItemStatus).labelOf(item.status))
          throw new Error(`Cannot transition from ${beforeLabel} to ${afterLabel}`)
        }
      }
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
}).mixin(Authorize<MigrationItem>({
  paths: (item) => {
    const status = useEnum(MigrationItemStatus).labelOf(item.status).toLowerCase()
    return [
      `migrationitem`,
      `migrationitem:${status}`,
    ]
  },
}))
  .mixin(DocumentBase())())
