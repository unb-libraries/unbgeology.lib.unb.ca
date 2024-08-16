import { MigrationItemStatus, type Entity, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { pageSize, page, filter } = getMigrationItemsDocumentQuery(event)

  const resources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r), { action: `update` })
  const migration = await Migration.mongoose.model.findById(id).select(`authTags`)
  if (!migration) {
    return create404()
  } else if (!resources.length || !migration.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  const { qid = `${new Date().valueOf()}` } = await readBody(event) ?? {}
  const items = await MigrationItem.mongoose.model.find({
    migration: migration._id,
    status: MigrationItemStatus.INITIAL,
    ...filter.id ?? {},
  }).skip((page - 1) * pageSize).limit(pageSize).select(`_id`)
  await MigrationItem.mongoose.model.updateMany({ _id: { $in: items } }, { queue: qid })

  function authorizedFetch<E extends Entity = Entity>(...params: Parameters<typeof $fetch>): Promise<EntityJSON<E>> {
    const sessionName = useRuntimeConfig().public.session.name
    const cookie = `${sessionName}=${getCookie(event, sessionName)}`
    params[1] ||= {}
    params[1].headers ||= {}
    params[1].headers.Cookie ||= cookie
    return $fetch(...params)
  }

  const { result } = await runTask(`migrate:import`, {
    payload: {
      qid,
      options: {
        fetch: authorizedFetch,
      },
    },
  })

  const queueURI = `${getRequestURL(event).pathname}/${qid}`
  return (result && authorizedFetch(queueURI)) || createError({ statusCode: 500, statusMessage: `Failed to queue migration items` })
})
