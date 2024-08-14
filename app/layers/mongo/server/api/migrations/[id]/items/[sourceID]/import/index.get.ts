import { MigrationItemStatus, type EntityJSON, type MigrationItem } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const self = getRequestURL(event).pathname
  const itemURI = self.split(`/`).slice(0, -1).join(`/`)
  const sessionName = useRuntimeConfig().public.session.name
  const cookie = `${sessionName}=${getCookie(event, sessionName)}`

  try {
    const item = await $fetch<EntityJSON<MigrationItem>>(itemURI, { headers: { Cookie: cookie } })
    return {
      self,
      status: useEnum(MigrationItemStatus)
        .labelOf(item.status)
        .toLowerCase(),
      // TODO: Add creation and completion date
    }
  } catch (err: unknown) {
    return err
  }
})
