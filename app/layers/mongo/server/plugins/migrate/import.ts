import { MigrationItemStatus, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import { type Document } from "mongoose"
import type { MigrationItem } from "../../documentTypes/MigrationItem"

export default defineNitroPlugin((nitro) => {
  const { INITIAL, QUEUED, PENDING, IMPORTED, ERRORED } = MigrationItemStatus

  nitro.hooks.hook(`migrate:import:item`, async (item, options) => {
    if (!(item.status & INITIAL)) {
      const label = useEnum(MigrationItemStatus).labelOf(item.status)
      throw new Error(`Cannot import "${label}" item`)
    }

    async function doImport(item: Document<any, {}, MigrationItem> & MigrationItem) {
      const { fetch } = options
      const bodies = await nitro.hooks.callHookParallel(`migrate:import:item:transform`, item, options)
      const body = { ...bodies.reduce((acc, body) => ({ ...acc, ...body }), {}), status: `migrated` }
      const uri = useAppConfig().entityTypes[item.migration.entityType].baseURI
      return await fetch<EntityJSON>(uri, { method: `POST`, body })
    }

    try {
      await item.set({ status: item.status & ~QUEUED | PENDING }).save()
      nitro.hooks.callHook(`migrate:import:item:pending`, item, options)
      const { self: entityURI } = await doImport(item)
      await item.set({ entityURI, status: IMPORTED }).save()
      nitro.hooks.callHook(`migrate:import:item:imported`, item)
    } catch (err: unknown) {
      const { message: error } = err as Error
      try {
        await item.set({ error, status: ERRORED }).save()
        nitro.hooks.callHook(`migrate:import:item:error`, item, error)
      } catch (err: unknown) {}
    } finally {
      nitro.hooks.callHook(`migrate:import:item:done`, item)
    }
  })
})
