import { MigrationItemStatus, MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import { defu } from "defu"
import type { Migration, MigrationItem, EntityJSON, EntityJSONList } from "@unb-libraries/nuxt-layer-entity"

export default defineNitroPlugin((nitroApp) => {
  // REFACTOR "migrate:import" hook to be implemented as nitro task (once feature becomes available)
  nitroApp.hooks.hook(`migrate:import`, async (uriOrMigration, config) => {
    const options = defu(config ?? {}, { limit: 100, chunkSize: 25, statusValue: `migrated` })
    const migration = typeof uriOrMigration === `string` ? await $fetch<Migration>(uriOrMigration) : uriOrMigration

    if (migration.status !== MigrationStatus.RUNNING) {
      await $fetch(migration.self, {
        method: `PATCH`,
        body: { status: useEnum(MigrationStatus).labelOf(MigrationStatus.RUNNING) },
      })
    }

    let pendingCount = 0
    function start() {
      pendingCount++
    }

    function done() {
      if (--pendingCount === 0) {
        nitroApp.hooks.callHook(`migrate:import`, migration)
      }
    }

    const { entities: items } = await $fetch<EntityJSONList<MigrationItem>>(`${migration.self}/items`, {
      query: {
        filter: [`status:equals:${MigrationItemStatus.QUEUED}`],
        select: [`id`, `data`, `status`],
      },
    })

    items.forEach(async (item) => {
      async function ready(data: any) {
        const { baseURI: uri } = useAppConfig().entityTypes[migration.entityType]

        try {
          const entity = await $fetch<EntityJSON>(uri, { method: `POST`, body: { status: options.statusValue, ...data } })
          await $fetch<EntityJSON<MigrationItem & { previous: EntityJSON<MigrationItem> }>>(item.self, {
            method: `PATCH`,
            body: { status: MigrationItemStatus.IMPORTED, entityURI: entity.self },
          })

          const updatedItem = await $fetch<EntityJSON<MigrationItem>>(item.self)
          nitroApp.hooks.callHook(`migrate:import:item:imported`, updatedItem, entity)
          nitroApp.hooks.callHook(`migrate:import:item:done`, updatedItem, entity)
          done()
        } catch (err: any) {
          error((err as Error).message)
        }
      }

      async function skip() {
        await $fetch<EntityJSON<MigrationItem>>(item.self, {
          method: `PATCH`,
          body: { status: MigrationItemStatus.SKIPPED },
        })

        const updatedItem = await $fetch<EntityJSON<MigrationItem>>(item.self)
        nitroApp.hooks.callHook(`migrate:import:item:skipped`, updatedItem)
        nitroApp.hooks.callHook(`migrate:import:item:done`, updatedItem)
        done()
      }

      async function error(errorMessage: string) {
        await $fetch<EntityJSON<MigrationItem>>(item.self, {
          method: `PATCH`,
          body: { status: MigrationItemStatus.ERRORED, error: errorMessage },
        })
        nitroApp.hooks.callHook(`migrate:import:item:error`, item, errorMessage)
        nitroApp.hooks.callHook(`migrate:import:item:done`, item, undefined, errorMessage)
        done()
      }

      await $fetch(item.self, { method: `PATCH`, body: { status: MigrationItemStatus.PENDING } })
      start()
      nitroApp.hooks.callHook(`migrate:import:item`, item.data, migration, { ready, error, skip })
    })
  })

  nitroApp.hooks.hook(`migrate:import:item:done`, async (item) => {
    const migrationURI = item.migration?.self
    if (migrationURI) {
      const { total: pendingCount } = await $fetch<EntityJSONList>(migrationURI, {
        query: {
          filter: [
            `status:equals:${MigrationItemStatus.PENDING}`,
            `status:equals:${MigrationItemStatus.QUEUED}`,
          ],
        },
      })
      if (pendingCount === 0) {
        await $fetch(migrationURI, {
          method: `PATCH`,
          body: {
            status: MigrationStatus.IDLE,
          },
        })
      }
    }
  })

  // REFACTOR "migrate:rollback" hook to be implemented as nitro task (once feature becomes available)
  nitroApp.hooks.hook(`migrate:rollback`, async (migration) => {
    await $fetch(migration.self, { method: `PATCH`, body: { status: MigrationStatus.RUNNING } })
    const { entities: items } = await $fetch<EntityJSONList<MigrationItem>>(`${migration.self}/items`, {
      query: {
        filter: [`status:equals:${MigrationItemStatus.IMPORTED}`],
        select: [`id`, `entityURI`, `status`],
      },
    })
    await Promise.all(items.filter(item => item.entityURI).map(({ entityURI }) => $fetch(entityURI!, { method: `DELETE` })))
    await $fetch(`${migration.self}/items`, {
      method: `PATCH`,
      body: {
        status: useEnum(MigrationItemStatus).labelOf(MigrationItemStatus.INITIAL),
        error: null,
      },
    })
    $fetch(migration.self, { method: `PATCH`, body: { status: MigrationStatus.IDLE } })
  })
})
