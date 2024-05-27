import { type Entity, type Stateful as IStateful } from "@unb-libraries/nuxt-layer-entity"
import { Status, type Collection as CollectionEntity } from "~/types/collection"
import { type Term } from "~/layers/mongo/server/documentTypes/Term"

export type Collection = Omit<CollectionEntity, keyof Entity> & IStateful<typeof Status> & Term
const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

export const Collection = defineDocumentModel(`Collection`, defineDocumentSchema<Portion>({
}).mixin(State)
  .mixin(Authorize<Collection>({
    paths: (collection) => {
      const status = useEnum(Status).labelOf(collection.status).toLowerCase()
      return [
        `term`,
        `term:${status}`,
        `term:collection`,
        `term:collection:${status}`,
      ]
    },
  }))(), Term)
