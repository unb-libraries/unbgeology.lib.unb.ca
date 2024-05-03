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

  const { items } = await readBody(event)
  if (items) {
    await $fetch(`/api/migrations/${migration._id}/items`, {
      method: `POST`,
      body: items,
    })
  }

  return await renderDocument<MigrationEntity, MigrationDoc>(migration, {
    model: Migration,
    self: migration => `/api/migrations/${migration._id}`,
    fields,
  })
})
