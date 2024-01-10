export default defineEventHandler(async (event) => {
  const migrations = await Migration
    .find()
    .populate(`source`)
    .populate(`dependencies`, `name entityType`)
  return sendEntityList(event, migrations, { total: await Migration.count() })
})
