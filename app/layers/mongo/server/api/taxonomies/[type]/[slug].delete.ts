export default defineEventHandler(useEntityDeleteHandler(Taxonomy, {
  discriminatorKey: `type`,
  findAndDelete: async (event, model) => {
    const { slug } = getRouterParams(event)
    const { _id } = await model.findByPK(slug)

    const ids = [_id]
    const childDocs = await model.aggregate()
      // Explicitly cast "id" to ObjectId as regular, implicit mongoose
      // casting is not supported in aggregation pipelines.
      // See: https://github.com/Automattic/mongoose/issues/1399
      .match({ _id })
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

    return ids
  },
}))
