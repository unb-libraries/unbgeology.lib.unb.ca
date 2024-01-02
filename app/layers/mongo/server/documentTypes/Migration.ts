import { type EntityDocument, EntityFieldTypes } from "layers/mongo/types/entity"
import { type Migration, Status } from "layers/base/types/migrate"

export default defineDocumentType<EntityDocument<Migration>>(`Migration`, {
  name: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
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
    enum: Status,
    default: Status.CREATED,
  },
})
