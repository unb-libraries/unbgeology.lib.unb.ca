import { MigrationItemStatus, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`migrate:rollback:item`, async (item, options) => {
    const status = item.get(`status`)
    const entityURI = item.get(`entityURI`)

    if (!(status & (MigrationItemStatus.IMPORTED | MigrationItemStatus.ERRORED | MigrationItemStatus.QUEUED))) {
      const label = useEnum(MigrationItemStatus).labelOf(status)
      throw new Error(`Cannot import "${label}" item`)
    }

    if (entityURI) {
      const { fetch } = options
      await fetch<EntityJSON>(entityURI, { method: `DELETE` })
    }

    item.set({ status: MigrationItemStatus.INITIAL, entityURI: null, error: null })
    await item.save()
  })
})
