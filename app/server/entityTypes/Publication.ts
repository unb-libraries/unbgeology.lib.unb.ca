import { Entity, EntityFieldTypes } from "~/layers/mongo/types/entity"

export interface Publication extends Entity {
  citation: string
  abstract: string
  doi?: string
}

export default defineEntityType<Publication>(`Publication`, {
  citation: {
    type: EntityFieldTypes.String,
    required: true,
  },
  abstract: {
    type: EntityFieldTypes.String,
    required: true,
  },
  doi: {
    type: EntityFieldTypes.String,
    required: false,
  },
})
