import { EntityFieldTypes } from "layers/mongo/types/entity"
import { type StorageLocation as TxStorageLocation, Status } from "types/storagelocation"
import { type TaxonomyTerm as ITaxonomyTerm } from "~/layers/mongo/server/documentTypes/TaxonomyTerm"

export type StorageLocation = Omit<TxStorageLocation, keyof ITaxonomyTerm> & ITaxonomyTerm
const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

export default defineDocumentModel(`StorageLocation`, defineDocumentSchema<StorageLocation>({
  public: {
    type: EntityFieldTypes.Boolean,
    default: false,
  },
}).mixin(State)(), TaxonomyTerm)
