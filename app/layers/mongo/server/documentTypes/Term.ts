import { type Term as TermEntity, type Entity } from "@unb-libraries/nuxt-layer-entity"
import { type DocumentBase } from "../../types/schema"
import { type Slugified } from "../../types/mixins"

export interface Term extends Omit<TermEntity, keyof Entity>, Slugified, DocumentBase {
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
