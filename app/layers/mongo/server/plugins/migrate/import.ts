import { MigrationItemStatus, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import { type Document } from "mongoose"
import type { MigrationItem } from "../../documentTypes/MigrationItem"

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`migrate:import:item`, async (item, options) => {
    const status = item.get(`status`)
    const entityURI = item.get(`entityURI`)
    const entityType = item.get(`migration.entityType`)

    if (status & ~(MigrationItemStatus.INITIAL | MigrationItemStatus.QUEUED | MigrationItemStatus.IMPORTED)) {
      const label = useEnum(MigrationItemStatus).labelOf(status)
      throw new Error(`Cannot import "${label}" item`)
    }

    async function doImport(item: Document<MigrationItem>) {
      const { fetch } = options

      item.set(`status`, MigrationItemStatus.PENDING)
      await item.save()

      const uri = entityURI || useAppConfig().entityTypes[entityType].baseURI
      const method = entityURI ? `PATCH` : `POST`

      const bodies = await nitro.hooks.callHookParallel(`migrate:import:item:transform`, item, options)
      const body = Object.fromEntries(Object.entries(bodies
        .reduce((acc, body) => ({ ...acc, ...body }), {}))
        .filter(([key]) => options.fields?.includes(key) || !options.fields?.length))
      if (!entityURI) {
        body.status = `migrated`
      }

      const entity = await fetch<EntityJSON>(uri, { method, body })

      item.set({ status: MigrationItemStatus.IMPORTED, entityURI: entity.self, error: null })
      await item.save()

      nitro.hooks.callHook(`migrate:import:item:imported`, item)
    }

    async function onError(err: Error, item: Document<MigrationItem>) {
      if (!entityURI) {
        item.set({ status: MigrationItemStatus.ERRORED })
      } else {
        item.set({ status })
      }
      item.set({ error: err.message })
      await item.save()
      nitro.hooks.callHook(`migrate:import:item:error`, item)
    }

    function onComplete(item: Document<MigrationItem>) {
      nitro.hooks.callHook(`migrate:import:item:done`, item)
    }

    try {
      await doImport(item)
    } catch (err: unknown) {
      await onError(err as Error, item)
    } finally {
      onComplete(item)
    }
  })
})
