import type { Entity, Stateful as IStateful } from "@unb-libraries/nuxt-layer-entity"
import { type Term } from "~/layers/mongo/server/documentTypes/Term"
import { Status, type Portion as PortionEntity } from "~/types/portion"

export type Portion = Omit<PortionEntity, keyof Entity> & IStateful<typeof Status> & Term
const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

export const FossilPortion = defineDocumentModel(`Portion.Fossil`, defineDocumentSchema<Portion>({
}).mixin(State)(), Term)
