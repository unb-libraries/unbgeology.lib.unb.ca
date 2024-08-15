import { MigrationItemStatus, type Entity, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import { type HTTPMethod } from "h3"

export default defineEventHandler(async (event) => {
  const { id, sourceID } = getRouterParams(event)

  const migrationResources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r))
  const migration = await Migration.findByID(id).select(`authTags`)
  if (!migration) {
    return create404()
  } else if (!migrationResources.length || !migration.authTags.some(t => migrationResources.includes(t))) {
    return create403()
  }

  const resources = getAuthorizedResources(event, r => /^migrationitem(:\w)*$/.test(r))
  if (!resources.length) {
    return create403()
  }

  const query = MigrationItem.mongoose.model.findOne()
    .populate({
      path: `migration`,
      select: `name entityType status dependencies`,
      populate: {
        path: `dependencies`,
        select: `name entityType status`,
      },
    })
    .where(`migration`).equals(parseObjectID(id))
    .where(`sourceID`).equals(sourceID)
    .select(`sourceID migration entityURI error status`)

  const body = await readBody(event)
  if (Object.keys(body).length) {
    query.select(`${Object.keys(body).map(k => `data.${k}`).join(` `)}`)
  } else {
    query.select(`data`)
  }

  const item = await query
  if (!item) {
    return create404()
  }

  if (item.status !== MigrationItemStatus.IMPORTED) {
    const statusLabel = useEnum(MigrationItemStatus).labelOf(item.status)
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: `Cannot update "${statusLabel}" item`,
    }))
  }

  const nitro = useNitroApp()
  nitro.hooks.callHook(`migrate:import:item`, item, {
    fetch<E extends Entity = Entity>(uri: string, options?: Partial<{ method: HTTPMethod, body: any }>): Promise<EntityJSON<E>> {
      const { method = `GET`, body = {} } = options ?? {}
      const sessionName = useRuntimeConfig().public.session.name
      const cookie = `${sessionName}=${getCookie(event, sessionName)}`
      return $fetch(uri, { method, body, headers: { Cookie: cookie } })
    },
  })

  return {
    self: getRequestURL(event).pathname,
    status: useEnum(MigrationItemStatus).labelOf(item.status).toLowerCase(),
  }
})
