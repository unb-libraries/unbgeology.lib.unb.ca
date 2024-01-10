export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const body = await readEntityBody(event, migrationBodyReader)
  const migration = await Migration
    .findByPKAndUpdate(id, body, { new: true })
    .populate(`source`)
    .populate(`dependencies`, `name entityType`)

  return sendEntityOr404(event, migration)
})
