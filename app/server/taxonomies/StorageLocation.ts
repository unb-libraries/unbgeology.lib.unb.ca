import { type Taxonomy } from "~/layers/mongo/types/taxonomy"
import { EntityFieldTypes } from "~/layers/mongo/types/entity"

export interface StorageLocation extends Taxonomy {
  public: boolean
}

export default defineTaxonomyType<StorageLocation>(`StorageLocation`, {
  public: {
    type: EntityFieldTypes.Boolean,
    default: false,
  },
})
