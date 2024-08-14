import { MigrationItemStatus, type EntityJSON, type MigrationItem } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const self = getRequestURL(event).pathname
  const itemURI = self.split(`/`).slice(0, -1).join(`/`)
  const sessionName = useRuntimeConfig().public.session.name
  const cookie = `${sessionName}=${getCookie(event, sessionName)}`
  const item = await $fetch<EntityJSON<MigrationItem>>(itemURI, { headers: { Cookie: cookie } })

  if (!item) {
    return create404()
  }

  const status = useEnum(MigrationItemStatus)
  if (status.valueOf(item.status) !== MigrationItemStatus.IMPORTED) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: `Cannot update "${status.labelOf(item.status)}" item`,
    }))
  }

  const nitro = useNitroApp()
  nitro.hooks.callHook(`migrate:import:item`, item)

  return $fetch<EntityJSON<MigrationItem>>(self, { headers: { Cookie: cookie } })
})
