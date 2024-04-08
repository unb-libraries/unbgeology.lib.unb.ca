export default defineMongooseReader(TaxonomyTerm, async (payload, options) => {
  const create = options?.op === `create`
  const { type } = await validateBody(payload, {
    type: requireIf(create, StringValidator),
  })

  const { parent } = await validateBody(payload, {
    parent: optional(URIEntityTypeValidator(type!)),
  })

  return {
    parent: parent ? parseObjectID(parent.id) : undefined,
  }
})
