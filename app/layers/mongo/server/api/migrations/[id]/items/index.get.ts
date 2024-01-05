export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const items = await MigrationItem
    .find({ migration: id })
    .populate(`migration`)

  return sendEntityList(event, items)
})
