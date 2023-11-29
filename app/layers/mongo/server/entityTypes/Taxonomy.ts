import { EntityFieldTypes } from "~/layers/mongo/types/entity"
import { type Taxonomy } from "~/layers/mongo/types/taxonomy"

export default defineEntityType<Taxonomy>(`Taxonomy`, {
  label: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
  },
  parent: {
    type: EntityFieldTypes.ObjectId,
    ref: `Taxonomy`,
    required: false,
  },
}, {
  slug: `label`,
  virtuals: {
    uri: {
      get() {
        return `/api/taxonomies/${this.type}/${this.pk}`
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
