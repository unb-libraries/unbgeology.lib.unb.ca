import { MigrationStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readBody(event)

  if (body.limit) {
    const query = MigrationItem
      .find({ migration: id, status: MigrationStatus.INITIAL })
      .limit(body.limit)
      .sort(`sourceID`)

    const items = await query.exec()
    await MigrationItem.updateMany({ _id: { $in: items } }, { status: MigrationStatus.QUEUED })
  } else {
    await MigrationItem.updateMany({ migration: id, status: MigrationStatus.INITIAL }, { status: MigrationStatus.QUEUED })
  }

  const migration = await Migration.findById(id)
  useNitroApp().hooks.callHook(`migrate:import`, migration)

  return sendNoContent(event, 202)
})
