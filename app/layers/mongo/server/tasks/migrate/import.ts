import { MigrationItemStatus, MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import type { Migration, MigrationItem, EntityJSONList, EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import { Status } from "~/types/affiliate"

export default defineTask({
  meta: {
    name: `migrate:import`,
    description: `Import a migration`,
  },
  async run({ payload }) {
    if (!payload.items) {
      throw new Error(`No items provided`)
    }

    const { items } = payload as { items: EntityJSONList<MigrationItem> }
    const nitro = useNitroApp()

    const { entities } = items
    if (entities.length === 0) {
      return { result: { importing: 0 } }
    }

    await $fetch(entities[0].migration.self, { method: `PATCH`, body: { status: MigrationStatus.RUNNING } })
    if (nitro) {
      const updated = await $fetch<Migration>(entities[0].migration.self)
      nitro.hooks.callHook(`migrate:import:start`, updated)
    }

    async function queue(uri: string): Promise<number> {
      const { entities, nav } = await $fetch<EntityJSONList>(uri, {
        method: `PATCH`,
        body: { status: MigrationItemStatus.QUEUED },
      })
      return nav.next ? entities.length + await queue(nav.next) : entities.length
    }

    async function doImport(): Promise<number> {
      const { entities, total } = await $fetch<EntityJSONList<MigrationItem>>(items.self, {
        query: {
          filter: [`status:equals:${MigrationItemStatus.QUEUED}`],
          select: [`id`, `data`, `migration`, `status`],
        },
      })

      await Promise.all(entities.map(async (item): Promise<void> => {
        try {
          await $fetch(item.self, { method: `PATCH`, body: { status: MigrationItemStatus.PENDING } })
          const entityType = useAppConfig().entityTypes[item.migration.entityType.split(`.`)[0]]
          const body = await nitro.hooks.callHook(`migrate:import:item`, item)
          const entity = await $fetch<EntityJSON>(entityType.baseURI, {
            method: `POST`,
            body: {
              ...body,
              status: Status.MIGRATED,
            },
          })
          await $fetch(item.self, {
            method: `PATCH`,
            body: {
              status: MigrationItemStatus.IMPORTED,
              entityURI: entity.self,
            },
          })
        } catch (err: unknown) {
          await $fetch(item.self, {
            method: `PATCH`,
            body: {
              status: MigrationItemStatus.ERRORED,
              error: (err as Error).message,
            },
          })
        } finally {
          if (nitro) {
            const updated = await $fetch<MigrationItem>(item.self)
            const status = useEnum(MigrationItemStatus).valueOf(updated.status)
            switch (status) {
              case MigrationItemStatus.IMPORTED:
                nitro.hooks.callHook(`migrate:import:item:imported`, updated); break
              case MigrationItemStatus.SKIPPED:
                nitro.hooks.callHook(`migrate:import:item:skipped`, updated); break
              case MigrationItemStatus.ERRORED:
                nitro.hooks.callHook(`migrate:import:item:error`, updated); break
            }
          }
        }
      }))

      if (total > entities.length) {
        doImport()
      } else {
        await $fetch(entities[0].migration.self, { method: `PATCH`, body: { status: MigrationStatus.IDLE } })
        if (nitro) {
          const updated = await $fetch<Migration>(entities[0].migration.self)
          nitro.hooks.callHook(`migrate:import:done`, updated)
        }
      }

      return total
    }

    await queue(items.self)
    doImport()

    return { result: { importing: items.total } }
  },
})
