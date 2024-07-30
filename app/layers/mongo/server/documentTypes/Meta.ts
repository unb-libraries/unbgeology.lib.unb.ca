import { EntityFieldTypes } from "../../types/entity"
import type { DocumentBase } from "../../types/schema"

export interface Meta extends DocumentBase {
  name: string
  counter: number
}

export default defineDocumentModel(`Meta`, defineDocumentSchema<Meta>({
  name: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
    immutable: true,
  },
  counter: {
    type: EntityFieldTypes.Number,
    default: 0,
  },
})())
