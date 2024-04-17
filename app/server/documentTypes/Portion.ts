import type { Entity, Stateful as IStateful } from "@unb-libraries/nuxt-layer-entity"
import { type Term } from "~/layers/mongo/server/documentTypes/Term"
import { Status, type Portion as PortionEntity } from "~/types/portion"

type Portion = Omit<PortionEntity, keyof Entity> & Term & IStateful<typeof Status>
const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

export const FossilPortion = defineDocumentModel(`Portion.Fossil`, defineDocumentSchema<Portion>({
}).mixin(State)(), Term)
