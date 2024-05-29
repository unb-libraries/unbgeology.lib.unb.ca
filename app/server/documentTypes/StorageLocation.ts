import { EntityFieldTypes } from "layers/mongo/types/entity"
import { type StorageLocation as TxStorageLocation, Status } from "types/storagelocation"
import { type Term as ITerm } from "~/layers/mongo/server/documentTypes/Term"
import { type Hierarchical as IHierarchical } from "~/layers/mongo/server/utils/mixins/Hierarchical"

export type StorageLocation = Omit<TxStorageLocation, keyof ITerm> & Omit<IHierarchical, `parent`> & ITerm & {
  parent?: StorageLocation
}

const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

export default defineDocumentModel(`StorageLocation`, defineDocumentSchema<StorageLocation>({
  public: {
    type: EntityFieldTypes.Boolean,
    default: false,
  },
}).mixin(Hierarchical<StorageLocation>({ sort: `label` }))
  .mixin(State)
  .mixin(Authorize<StorageLocation>({
    paths: (location) => {
      const status = useEnum(Status).labelOf(location.status).toLowerCase()
      return [
        `term`,
        `term:${status}`,
        `term:storagelocation`,
        `term:storagelocation:${status}`,
      ]
    },
  }))(), Term)
