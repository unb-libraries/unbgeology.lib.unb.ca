export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const items = await MigrationItem.find({ migration: id })
  await Promise.all(items.map(async (item) => {
    if (item.destinationID) {
      await $fetch(item.destinationID, { method: `DELETE` })
    }
  }))

  await MigrationItem.deleteMany({ migration: id })
  await Migration.findByPKAndDelete(id)

  return sendNoContent(event)
})
