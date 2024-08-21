import { MigrationItemStatus, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import { type Document } from "mongoose"
import type { MigrationItem } from "../../documentTypes/MigrationItem"

export default defineNitroPlugin((nitro) => {
  const { QUEUED, PENDING, IMPORTED } = MigrationItemStatus

  nitro.hooks.hook(`migrate:import:item:update`, async (item, options) => {
    if (!(item.status & IMPORTED)) {
      const label = useEnum(MigrationItemStatus).labelOf(item.status)
      throw new Error(`Cannot import "${label}" item`)
    }

    async function doUpdate(item: Document<any, {}, MigrationItem> & MigrationItem) {
      const { fetch, fields } = options
      const bodies = await nitro.hooks.callHookParallel(`migrate:import:item:transform`, item, options)
      const body = Object.fromEntries(Object.entries(bodies
        .reduce((acc, body) => ({ ...acc, ...body }), {}))
        .filter(([key]) => fields?.includes(key) || !fields?.length))
      return await fetch<EntityJSON>(item.entityURI!, { method: `PATCH`, body })
    }

    try {
      await item.set({ status: item.status & ~QUEUED | PENDING }).save()
      nitro.hooks.callHook(`migrate:import:item:pending`, item, options)
      const { self: entityURI } = await doUpdate(item)
      await item.set({ entityURI, error: null, status: item.status & ~PENDING }).save()
      nitro.hooks.callHook(`migrate:import:item:updated`, item)
    } catch (err: unknown) {
      const { message: error } = err as Error
      await item.set({ error, status: item.status & ~PENDING }).save()
      nitro.hooks.callHook(`migrate:import:item:error`, item, err as Error)
    } finally {
      nitro.hooks.callHook(`migrate:import:item:done`, item)
    }
  })
})
