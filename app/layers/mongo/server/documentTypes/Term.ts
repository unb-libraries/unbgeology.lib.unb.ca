import { type Term as TermEntity, type Entity } from "@unb-libraries/nuxt-layer-entity"
import { type DocumentBase } from "../../types/schema"

export interface Term extends Omit<TermEntity, keyof Entity>, DocumentBase {
}

export default defineDocumentModel<Term>(`Term`, defineDocumentSchema<Term>({
  label: {
    type: String,
    required: true,
  },
}).mixin(Slugified<Term>({
  path: `label`,
}))
  .mixin(DocumentBase())())
