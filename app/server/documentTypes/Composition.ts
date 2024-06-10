import type { Entity, Stateful as IStateful } from "@unb-libraries/nuxt-layer-entity"
import { type Composition as CompositionEntity, Status } from "~/types/composition"
import Term, { type Term as ITerm } from "~/layers/mongo/server/documentTypes/Term"

export type Composition = Omit<CompositionEntity, keyof Entity> & IStateful<typeof Status> & ITerm
const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

export default {
  Fossil: defineDocumentModel(`Composition.Fossil`, defineDocumentSchema<Composition>({
  }).mixin(State)
    .mixin(Authorize<Composition>({
      paths: (composition) => {
        const status = useEnum(Status).labelOf(composition.status).toLowerCase()
        return [
          `term`,
          `term:${status}`,
          `term:composition:fossil`,
          `term:composition:${status}`,
          `term:composition:fossil:${status}`,
        ]
      },
    }))(), Term),

  Rock: defineDocumentModel(`Composition.Rock`, defineDocumentSchema<Composition>({
  }).mixin(State)
    .mixin(Authorize<Composition>({
      paths: (composition) => {
        const status = useEnum(Status).labelOf(composition.status).toLowerCase()
        return [
          `term`,
          `term:${status}`,
          `term:composition:rock`,
          `term:composition:${status}`,
          `term:composition:rock:${status}`,
        ]
      },
    }))(), Term),
}
