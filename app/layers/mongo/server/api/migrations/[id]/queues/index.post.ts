import { MigrationItemStatus, type Entity, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r), { action: `update` })
  const migration = await Migration.mongoose.model.findById(id).select(`authTags`)
  if (!migration) {
    return create404()
  } else if (!resources.length || !migration.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  const { qid = `${new Date().valueOf()}`, type, ids, fields } = await readBody<{ qid?: string, type?: `import` | `rollback`, ids?: string[], fields?: string[] }>(event)
  const query = MigrationItem.mongoose.model.updateMany({}, { queue: qid })
    .where(`migration`).equals(migration)
    .where(`status`).in([MigrationItemStatus.IMPORTED, type === `import` ? MigrationItemStatus.INITIAL : MigrationItemStatus.ERRORED])
  ids?.length && query.where(`sourceID`).in(ids)
  await query

  function authorizedFetch<E extends Entity = Entity>(...params: Parameters<typeof $fetch>): Promise<EntityJSON<E>> {
    const sessionName = useRuntimeConfig().public.session.name
    const cookie = `${sessionName}=${getCookie(event, sessionName)}`
    params[1] ||= {}
    params[1].headers ||= {}
    params[1].headers.Cookie ||= cookie
    return $fetch(...params)
  }

  const { result } = await runTask(type === `import` ? `migrate:import` : `migrate:rollback`, {
    payload: {
      qid,
      options: {
        fields: type === `import` ? fields : undefined,
        fetch: authorizedFetch,
      },
    },
  })

  const queueURI = `${getRequestURL(event).pathname}/${qid}`
  return (result && authorizedFetch(queueURI)) || createError({ statusCode: 500, statusMessage: `Failed to queue migration items` })
})
