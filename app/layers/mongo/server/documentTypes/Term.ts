import { type Term as TermEntity, type Entity } from "@unb-libraries/nuxt-layer-entity"
import { type DocumentBase } from "../../types/schema"
import type { Authorize } from "../utils/mixins/Authorize"

export interface Term extends Omit<TermEntity, keyof Entity>, Authorize, DocumentBase {
}

export default defineDocumentModel<Term>(`Term`, defineDocumentSchema<Term>({
  label: {
    type: String,
    required: true,
  },
}, {
  alterSchema(schema) {
    schema.index({ label: 1, type: 1 }, { unique: true })
  },
}).mixin(Slugified<Term>({
  path: `label`,
}))
  .mixin(DocumentBase())())
