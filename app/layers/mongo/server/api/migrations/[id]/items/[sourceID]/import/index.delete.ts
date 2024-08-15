import { type HTTPMethod } from "h3"
import { MigrationItemStatus, type Entity, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"

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

  const item = await MigrationItem.mongoose.model.findOne()
    .populate({
      path: `migration`,
      populate: `dependencies`,
    })
    .where(`migration`).equals(parseObjectID(id))
    .where(`sourceID`).equals(sourceID)

  if (!item) {
    return create404()
  }

  if ((item.status as MigrationItemStatus) & ~(MigrationItemStatus.IMPORTED | MigrationItemStatus.ERRORED)) {
    const statusLabel = useEnum(MigrationItemStatus).labelOf(item.status)
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: `Cannot rollback "${statusLabel}" item`,
    }))
  }

  const nitro = useNitroApp()
  nitro.hooks.callHook(`migrate:rollback:item`, item, {
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
