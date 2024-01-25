export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const migration = await Migration.findOne({ _id: id })
  useNitroApp().hooks.callHook(`migrate:rollback`, migration)

  return sendNoContent(event, 202)
})
