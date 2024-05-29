export default defineMongooseReader(TaxonomyTerm, async (payload, options) => {
  const create = options?.op === `create`
  const { parent } = await validateBody(payload, {
    type: requireIf(create, StringValidator),
    // FIX: Work around as URIEntityTypeValidator cannot authorize against the API
    parent: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
  })

  return {
    parent: parent && { _id: parent.substring(1).split(`/`).at(-1)! },
  }
})
