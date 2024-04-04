import { type Term } from "@unb-libraries/nuxt-layer-entity"
import { optional, requireIf, StringValidator as String, URIMatchValidator as URI, validateBody } from "../../utils/api/payload"

const options = { validate: expectDistriminatorType(`taxonomy`) }

export default defineMongooseReader(TaxonomyTerm, async (body, options) => {
  const create = options?.op === `create`
  const { parent } = await validateBody(body, {
    type: requireIf(create, String),
    parent: optional(URI<Term>(/\/api\/terms/)),
  })

  return {
    type: TaxonomyTerm.fullName,
    parent: parent ? parseObjectID(parent.id) : undefined,
  }
}, options)
