import { type EntityDocument, EntityFieldTypes } from "layers/mongo/types/entity"
import { type Term as ITerm, type TaxonomyTerm as ITaxonomyTerm } from "layers/base/types/entity"

export const TermBase = defineDocumentType<EntityDocument<ITerm>>(`Term`, {
  label: {
    type: EntityFieldTypes.String,
    required: true,
  },
}, {
  slug: `_id`,
  statics: {
    baseURL() {
      return `/api/terms`
    },
  },
  virtuals: {
    uri: {
      get(this: EntityDocument<ITerm>) {
        const chunks = this.type.split(`.`)
        if (chunks.length < 2) {
          chunks.splice(0, 0, `default`)
        }
        return `/api/terms/${chunks.join(`/`)}/${this.slug}`
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
