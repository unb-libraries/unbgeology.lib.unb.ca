import { type EntityDocument, EntityFieldTypes } from "layers/mongo/types/entity"
import { type Term as ITerm, type TaxonomyTerm as ITaxonomyTerm } from "layers/base/types/entity"

export const TermBase = defineDocumentType<EntityDocument<ITerm>>(`Term`, {
  label: {
    type: EntityFieldTypes.String,
    required: true,
  },
}, {
  slug: `_id`,
  virtuals: {
    uri: {
      get(this: EntityDocument<ITerm>) {
        return `/api/vocabularies/${this.type}/${this.slug}`
      },
    },
  },
  toJSON: {
    transform(doc, ret, options) {
      if (ret.parent === null) {
        delete ret.parent
      }

      ret.slug = doc._id
      delete ret.id
    },
  },
})

export const Term = defineDocumentBundle<EntityDocument<ITerm>>(TermBase, `Term`)

export const TaxonomyTerm = defineDocumentBundle<EntityDocument<ITaxonomyTerm>>(TermBase, `TaxonomyTerm`, {
  parent: {
    type: EntityFieldTypes.ObjectId,
    ref: `Term.TaxonomyTerm`,
    required: false,
  },
})
