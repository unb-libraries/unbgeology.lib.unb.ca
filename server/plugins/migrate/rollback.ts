import { MigrationItemStatus, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"

export default defineNitroPlugin((nitro) => {
  const { INITIAL, IMPORTED, ERRORED } = MigrationItemStatus

  nitro.hooks.hook(`migrate:rollback:item`, async (item, options) => {
    const { status, entityURI } = item

    if (!(item.status & IMPORTED | ERRORED)) {
      const label = useEnum(MigrationItemStatus).labelOf(status)
      throw new Error(`Cannot import "${label}" item`)
    }

    try {
      const { fetch } = options
      entityURI && await fetch<EntityJSON>(entityURI, { method: `DELETE` })
    } catch (err: unknown) {
      nitro.hooks.callHook(`migrate:rollback:item:error`, item, err as Error)
    } finally {
      await item.set({ status: INITIAL, entityURI: null, error: null }).save()
      nitro.hooks.callHook(`migrate:rollback:item:done`, item, options)
    }
  })
})
