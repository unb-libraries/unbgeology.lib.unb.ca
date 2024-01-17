import { MigrationStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const migration = await Migration.findOneAndUpdate(
    { _id: id, status: MigrationStatus.RUNNING },
    { status: MigrationStatus.IDLE },
    { new: true })

  if (!migration) {
    const error = createError({ statusCode: 400, statusMessage: `Cannot pause migration ${id} as it is not running.` })
    return sendError(event, error)
  }

  return sendNoContent(event, 202)
})
