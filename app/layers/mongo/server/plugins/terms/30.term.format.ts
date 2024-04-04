import { type Term } from "@unb-libraries/nuxt-layer-entity"

export default defineMongooseFormatter(Term, (doc): Partial<Term> => {
  const { _id, label, slug, type, created, updated } = doc
  return {
    id: `${_id}`,
    label,
    slug,
    type: type ? `term` : undefined,
    created: created ? new Date(created).toISOString() : undefined,
    updated: updated ? new Date(updated).toISOString() : undefined,
  }
})
