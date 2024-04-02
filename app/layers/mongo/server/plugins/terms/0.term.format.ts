import { type Term as TermEntity } from "@unb-libraries/nuxt-layer-entity"
import { type Term as TermDocument } from "../../documentTypes/Term"

export default defineEntityFormatter<TermEntity, TermDocument>(Term, (doc) => {
  const { _id, label, slug, created, updated, __type } = doc
  const render = {
    id: `${_id}`,
    label,
    slug,
    created: created ? new Date(created).toISOString() : undefined,
    updated: updated ? new Date(updated).toISOString() : undefined,
  }

  return !__type
    ? {
        ...render,
        type: `term`,
      }
    : render
})
