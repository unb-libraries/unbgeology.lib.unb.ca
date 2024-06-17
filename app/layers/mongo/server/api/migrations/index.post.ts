import { type Migration as MigrationEntity } from "@unb-libraries/nuxt-layer-entity"
import { type Migration as MigrationDoc } from "../../documentTypes/Migration"

export default defineEventHandler(async (event) => {
  const resources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const body = await readOneDocumentBodyOr400(event, { model: Migration, fields })
  const migration = await Migration.create(body)

  return await renderDocument<MigrationEntity, MigrationDoc>(migration, {
    model: Migration,
    self: migration => `/api/migrations/${migration._id}`,
    fields,
  })
})
