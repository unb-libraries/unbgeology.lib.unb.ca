import { MigrationStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  console.log(useCurrentServerSession(event))

  const resources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const migration = await Migration.findByID(id).select(`authTags`, `status`)
  const body = await readOneDocumentBodyOr400(event, {
    model: Migration,
    flat: true,
    fields: fields.filter(field => migration?.status === MigrationStatus.IDLE || field === `status`),
  })

  if (migration && !migration.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  if (Object.keys(body).length) {
    return renderDocumentDiffOr404(await migration?.update(body))
  }
  return sendNoContent(event)
})
