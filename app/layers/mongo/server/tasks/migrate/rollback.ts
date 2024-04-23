import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"
import type { MigrationItem, EntityJSONList } from "@unb-libraries/nuxt-layer-entity"

export default defineTask({
  meta: {
    name: `migrate:rollback`,
    description: `Rollback a migration`,
  },
  run({ payload }) {
    if (!payload.items) {
      throw new Error(`No items provided`)
    }

    const { items } = payload as { items: EntityJSONList<MigrationItem> }

    async function rollback(uri: string): Promise<number> {
      const { entities, nav } = await $fetch<EntityJSONList<MigrationItem>>(uri, {
        query: {
          select: [`id`, `entityURI`, `status`],
        },
      })

      entities.filter(item => item.entityURI).map(item => item.entityURI!).forEach((entityURI) => {
        $fetch(entityURI, { method: `DELETE` })
      })
      $fetch(uri, {
        method: `PATCH`,
        body: {
          status: MigrationItemStatus.INITIAL,
          error: null,
          entityURI: null,
        },
      })

      return nav.next ? entities.length + await rollback(nav.next) : entities.length
    }

    rollback(items.self)
    return { result: items.total }
  },
})
