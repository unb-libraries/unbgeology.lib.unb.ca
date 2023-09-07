import { type DiscriminatedEntity, EntityFieldTypes } from "~/types/entity"

export interface ITaxonomy extends DiscriminatedEntity {
  label: string
  slug: string
  parent?: ITaxonomy
}

export default defineEntityType<ITaxonomy>(`Taxonomy`, {
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
