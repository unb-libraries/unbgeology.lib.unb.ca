import { type StorageLocation } from "types/taxonomy"
import { type EntityDocument, EntityFieldTypes } from "~/layers/mongo/types/entity"

type StorageLocationTaxonomy = EntityDocument<StorageLocation>

export default defineTaxonomyType<StorageLocationTaxonomy>(`StorageLocation`, {
  public: {
    type: EntityFieldTypes.Boolean,
    default: false,
  },
})
