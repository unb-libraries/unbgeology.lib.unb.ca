export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const items = await MigrationItem
    .find({ migration: id })
    .populate({ path: `migration`, populate: { path: `dependencies` } })

  useNitroApp().hooks.callHook(`migrate:import`, items)

  return sendNoContent(event, 202)
})
