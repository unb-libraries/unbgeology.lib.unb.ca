import { type ITaxonomy } from "entity-types/Taxonomy"
import { EntityFieldTypes } from "~/types/entity"

export interface StorageLocation extends ITaxonomy {
  public: boolean
}

export default defineTaxonomyType<StorageLocation>(`StorageLocation`, {
  public: {
    type: EntityFieldTypes.Boolean,
    default: false,
  },
})
