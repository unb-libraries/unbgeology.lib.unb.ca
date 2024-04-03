import type { Entity } from "@unb-libraries/nuxt-layer-entity"
import TermBase, { type Term } from "~/layers/mongo/server/documentTypes/Term"
import { Status, type Affiliate as AffiliateEntity } from "~/types/affiliation"

export interface Affiliate extends Omit<AffiliateEntity, keyof Entity>, Term {
}

export default defineDocumentModel<Term, Affiliate>(`Affiliate`, defineDocumentSchema<Affiliate>({
}).mixin(Stateful({
  values: Status,
  default: Status.DRAFT,
}))(), TermBase)
