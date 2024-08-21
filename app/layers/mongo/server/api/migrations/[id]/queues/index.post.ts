import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"
import { Int32 } from "mongodb"

const { INITIAL, IMPORTED, ERRORED } = MigrationItemStatus

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r), { action: `update` })
  const migration = await Migration.mongoose.model.findById(id).select(`authTags`)
  if (!migration) {
    return create404()
  } else if (!resources.length || !migration.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  const { qid = `${new Date().valueOf()}`, type = `import`, ids, fields } = await readBody<{ qid?: string, type?: `import` | `update` | `rollback`, ids?: string[], fields?: string[] }>(event)
  const query = MigrationItem.mongoose.model.updateMany({ migration }, { queue: qid })
  type === `import` && query.where({ status: { $bitsAnySet: new Int32(INITIAL) } })
  type === `update` && query.where({ status: { $bitsAnySet: new Int32(IMPORTED) } })
  type === `rollback` && query.where({ status: { $bitsAnySet: new Int32(IMPORTED | ERRORED) } })
  ids?.length && query.where({ sourceID: { $in: ids } })
  await query

  const { result } = await runTask([`import`, `update`].includes(type) ? `migrate:import` : `migrate:rollback`, {
    payload: {
      qid,
      options: {
        fields: type === `update` ? fields : undefined,
        fetch: $fetchWithSession(event),
      },
    },
  })

  const queueURI = `${getRequestURL(event).pathname}/${qid}`
  return (result && $fetchWithSession(event)(queueURI)) || createError({ statusCode: 500, statusMessage: `Failed to queue migration items` })
})
