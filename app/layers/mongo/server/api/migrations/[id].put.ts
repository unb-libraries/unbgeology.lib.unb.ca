export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const body = await readEntityBody(event, migrationBodyReader)
  const migration = await Migration
    .findByPKAndUpdate(id, body, { new: true })
    .populate(`source`)

  return sendEntityOr404(event, migration)
})
