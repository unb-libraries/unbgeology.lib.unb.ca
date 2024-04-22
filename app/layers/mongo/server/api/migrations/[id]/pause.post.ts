import { MigrationStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const migration = await Migration.findOne({ _id: id })
  if (!migration) {
    const error = createError({ statusCode: 404, statusMessage: `Migration ${id} not found.` })
    return sendError(event, error)
  } else if (migration.status !== MigrationStatus.RUNNING) {
    const error = createError({ statusCode: 400, statusMessage: `Cannot pause migration ${id} as it is not running.` })
    return sendError(event, error)
  }

  useNitroApp().hooks.callHook(`migrate:pause`, migration)

  return sendNoContent(event, 202)
})
