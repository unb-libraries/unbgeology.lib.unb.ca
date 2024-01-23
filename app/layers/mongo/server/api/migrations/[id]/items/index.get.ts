export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { sort, pageSize, page } = getQueryOptions(event)

  const items = await MigrationItem
    .find({ migration: id })
    .populate(`migration`)
    .sort(sort.join(` `))
    .paginate(page, pageSize)

  return sendEntityList(event, items)
})
