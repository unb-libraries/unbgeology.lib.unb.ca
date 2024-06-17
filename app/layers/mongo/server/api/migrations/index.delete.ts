import { MigrationStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const resources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r))
  if (!resources.length) {
    return create403()
  }

  const query = Migration.find()
    .where(`status`).eq(MigrationStatus.IDLE)
    .and(`authTags`).in(resources)
  await useEventQuery(event, query)

  const { documents: migrations } = await query.paginate(page, pageSize)

  const idleMigrations = migrations.filter(migration => migration.status === MigrationStatus.IDLE)
  await Promise.all(idleMigrations.map(migration => migration.delete()))

  return {
    deleted: idleMigrations.length,
  }
})
