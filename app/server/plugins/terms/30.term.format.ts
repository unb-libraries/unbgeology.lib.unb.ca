import { type Term } from "@unb-libraries/nuxt-layer-entity"

export default defineMongooseFormatter(Term, (doc): Partial<Term> | void => {
  if (!(doc.__type && doc.__type.startsWith(Term.fullName))) { return }

  const { _id, label, slug, created, updated } = doc
  return {
    id: `${_id}`,
    label,
    slug,
    created: created ? new Date(created).toISOString() : undefined,
    updated: updated ? new Date(updated).toISOString() : undefined,
  }
})
