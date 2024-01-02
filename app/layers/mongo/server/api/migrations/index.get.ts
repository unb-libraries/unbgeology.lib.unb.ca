export default defineEventHandler(async (event) => {
  const migrations = await Migration
    .find()
    .populate(`source`)
  return sendEntityList(event, migrations, { total: await Migration.count() })
})
