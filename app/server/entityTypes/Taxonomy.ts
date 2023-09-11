import { type DiscriminatedEntity, EntityFieldTypes } from "~/types/entity"

export interface Taxonomy extends DiscriminatedEntity {
  label: string
  slug: string
  parent?: Taxonomy
}

export default defineEntityType<Taxonomy>(`Taxonomy`, {
  label: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
  },
  slug: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
  },
  parent: {
    type: EntityFieldTypes.ObjectId,
    ref: `Taxonomy`,
    required: false,
  },
})
