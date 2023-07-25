import { type Entity, EntityFieldTypes } from "~/types/entity"

export interface Classification extends Entity {
  name: string
  slug: string
  super?: Classification
  imageFilename?: String,
}

export default defineEntityType(`Classification`, {
  name: {
    type: EntityFieldTypes.String,
    required: true,
  },
  slug: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
  },
  super: {
    type: EntityFieldTypes.ObjectId,
    ref: `Classification`,
    required: false,
  },
  imageFilename: {
    type: EntityFieldTypes.String,
    required: false,
  },
})
