export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  await MigrationItem.deleteMany({ migration: id })
  await Migration.findByPKAndDelete(id)

  return sendNoContent(event)
})
