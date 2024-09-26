import type { Term as TermEntity, Entity } from '@unb-libraries/nuxt-layer-entity'
import type { DocumentBase as IDocumentBase } from '../../types/schema'
import type { Authorize } from '../utils/mixins/Authorize'

export interface Term extends Omit<TermEntity, keyof Entity>, Authorize, IDocumentBase {
}

export default defineDocumentModel<Term>(`Term`, defineDocumentSchema<Term>({
  label: {
    type: String,
    required: true,
  },
}, {
  alterSchema(schema) {
    schema.index({ label: 1, type: 1, parent: 1 }, { unique: true })
  },
}).mixin(Slugified<Term>({
  async path(term) {
    // REFACTOR: Terms are not hierarchical, move to Taxonomy type
    const label = term.get(`label`)
    if (term.get(`parent`)) {
      await term.populate(`parent`)
      const parent = term.get(`parent`)
      return parent.slug ? `${parent.slug} ${label}` : label
    }
    return label
  },
}))
  .mixin(DocumentBase())())
