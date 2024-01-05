export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const migration = await Migration
    .findByPK(id)
    .populate(`source`)

  return sendEntityOr404(event, migration)
})
