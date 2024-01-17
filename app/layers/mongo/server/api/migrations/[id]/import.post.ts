import { MigrationStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const items = await MigrationItem
    .find({ migration: id, status: { $nin: [MigrationStatus.IMPORTED, MigrationStatus.SKIPPED, MigrationStatus.ERRORED] } })
    .populate({ path: `migration`, populate: { path: `dependencies` } })

  useNitroApp().hooks.callHook(`migrate:import`, items)

  return sendNoContent(event, 202)
})
