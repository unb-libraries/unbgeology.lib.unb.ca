import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readBody(event)

  if (body && body.limit) {
    const { documents: items } = await MigrationItem.find()
      .where(`migration`).eq(parseObjectID(id))
      .and(`status`).eq(MigrationItemStatus.INITIAL)
      .paginate(1, body.limit)
      .sort(`sourceID`)
    await MigrationItem.update({ status: MigrationItemStatus.QUEUED })
      .where(`_id`).in(items)
  } else {
    await MigrationItem.update({ status: MigrationItemStatus.QUEUED })
      .where(`migration`).eq(parseObjectID(id))
      .and(`status`).eq(MigrationItemStatus.INITIAL)
  }

  const migration = await Migration.mongoose.model.findById(id)
  useNitroApp().hooks.callHook(`migrate:import`, migration)

  return sendNoContent(event, 202)
})
