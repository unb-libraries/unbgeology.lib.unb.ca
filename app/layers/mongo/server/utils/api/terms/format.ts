import { type Term as TermEntity } from "@unb-libraries/nuxt-layer-entity"
import { type Term as TermDocument } from "../../../documentTypes/Term"

export default defineEntityFormatter<TermEntity, TermDocument>((doc) => {
  const { _id, label, slug, type, created, updated } = doc
  return {
    id: `${_id}`,
    label,
    slug,
    type,
    created: created ? new Date(created).toISOString() : undefined,
    updated: updated ? new Date(updated).toISOString() : undefined,
  }
})
