export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const migration = await Migration
    .findByPK(id)
    .populate(`source`)
    .populate(`dependencies`, `name entityType`)

  return sendEntityOr404(event, migration)
})
