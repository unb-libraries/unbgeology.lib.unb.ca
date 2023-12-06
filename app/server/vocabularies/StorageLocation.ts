import { type StorageLocation } from "types/vocabularies"
import { type EntityDocument, EntityFieldTypes } from "layers/mongo/types/entity"

type StorageLocationTaxonomy = EntityDocument<StorageLocation>

export default defineTaxonomy<StorageLocationTaxonomy>(`StorageLocation`, {
  public: {
    type: EntityFieldTypes.Boolean,
    default: false,
  },
})
