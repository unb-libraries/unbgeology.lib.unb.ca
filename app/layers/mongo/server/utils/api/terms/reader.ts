import { type Entity, type Term as TermEntity } from "@unb-libraries/nuxt-layer-entity"
import { type Term as TermDocument } from "../../../documentTypes/Term"
import type { DocumentBase } from "~/layers/mongo/types/schema"

type TermEntityBody = Omit<TermEntity, keyof Entity>
type TermDocumentBody = Omit<TermDocument, keyof DocumentBase>

export default defineBodyReader<TermEntityBody, TermDocumentBody>((body) => {
  const { label, slug, type } = body
  return {
    label,
    slug,
    type,
  }
})
