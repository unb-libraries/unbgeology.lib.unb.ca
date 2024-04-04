import { type Term } from "@unb-libraries/nuxt-layer-entity"
import { optional, requireIf, StringValidator as String, URIMatchValidator as URI, validateBody } from "../../utils/api/payload"
import { type TaxonomyTerm as ITaxonomyTerm } from "../../documentTypes/TaxonomyTerm"

export default defineBodyReader<Pick<ITaxonomyTerm, `type` | `parent`>>(Term, async (body, options) => {
  const create = options?.op === `create`
  const { type, parent } = await validateBody(body, {
    type: requireIf(create, String),
    parent: optional(URI<Term>(/\/api\/terms/)),
  })

  return type === `taxonomy`
    ? {
        type: TaxonomyTerm.fullName,
        parent: parent ? parseObjectID(parent.id) : undefined,
      }
    : {}
})
