export default defineEventHandler(async (event) => {
  const { domain, type, slug } = getRouterParams(event)
  const term = await TermBase.findOne({ type: domain === `default` ? type : `${domain}.${type}`, slug })
    .populate(`parent`, `_id`)

  if (!term) {
    throw createError({ statusCode: 404, statusMessage: `Taxonomy entity "${slug}" of type "${type.toUpperCase()}" does not exist.` })
  }

  const ids = [term._id]
  const childDocs = await TermBase.aggregate()
    // Explicitly cast "id" to ObjectId as regular, implicit mongoose
    // casting is not supported in aggregation pipelines.
    // See: https://github.com/Automattic/mongoose/issues/1399
    .match({ _id: term._id })
    .graphLookup({
      from: `taxonomies`,
      startWith: `$_id`,
      connectFromField: `_id`,
      connectToField: `parent`,
      as: `child`,
    })
    .project({
      child: {
        _id: 1,
      },
    })

  if (childDocs.length > 0) {
    ids.push(...childDocs[0].child.map((child: { _id: string }) => child._id))
  }
  await TermBase.deleteMany({ _id: ids })

  return $fetch(`${TermBase.baseURL()}/${domain}/${type}`)
})
