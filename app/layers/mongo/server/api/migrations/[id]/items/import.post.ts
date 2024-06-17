import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const migrationResources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r), { action: `update` })
  const migration = await Migration.findByID(id).select(`authTags`)
  if (!migration) {
    return create404()
  } else if (!migrationResources.length || !migration.authTags.some(t => migrationResources.includes(t))) {
    return create403()
  }

  // TODO: Find a way to use DocumentQuery and possibly update ALL items, using pagination only if specified
  await MigrationItem.mongoose.model.updateMany(
    { migration: migration._id, status: MigrationItemStatus.INITIAL },
    { status: MigrationItemStatus.QUEUED },
  )

  await runTask(`migrate:import`, {
    payload: {
      migration: `${migration._id}`,
    },
  })
})
