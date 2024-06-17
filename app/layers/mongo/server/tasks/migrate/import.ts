import { MigrationItemStatus, MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import { consola } from "consola"
import type { EntityJSON, Entity } from "@unb-libraries/nuxt-layer-entity"
import { type MigrationItem as IMigrationItem } from "../../documentTypes/MigrationItem"
import { type Migration as IMigration } from "../../documentTypes/Migration"
import { Status } from "~/types/affiliate"

type HookName = Parameters<ReturnType<typeof useNitroApp>[`hooks`][`callHook`]>[0]
type HookParams = Parameters<ReturnType<typeof useNitroApp>[`hooks`][`callHook`]>[1]

function getAuthHeaders(): { Cookie?: string } {
  const event = useEvent()
  if (event) {
    const sessionName = useRuntimeConfig().public.session.name
    return { Cookie: `${sessionName}=${getCookie(event, sessionName)}` }
  }
  return {}
}

async function callHook<T = any, P extends boolean = false>(name: HookName, params: HookParams, options?: Partial<{ parallel: P }>): Promise<P extends true ? (T | {})[] : T | {}> {
  const nitro = useNitroApp()
  if (!nitro) {
    consola.log(`Nitro instance not available.`)
    return (options?.parallel ? [] : {}) as P extends true ? [] : {}
  }
  return (options?.parallel
    ? await nitro.hooks.callHookParallel(name, ...params)
    : await nitro.hooks.callHook(name, ...params)) as P extends true ? T[] : T
}

function useHook(name: HookName, handler: (...args: HookParams) => void) {
  const nitro = useNitroApp()
  if (nitro) {
    nitro.hooks.hook(name, handler)
  }
}

async function setItem(item: IMigrationItem, values: Partial<IMigrationItem>) {
  return await MigrationItem.mongoose.model.findByIdAndUpdate(item._id, values, { returnDocument: `after` }).populate(`migration`)
}

async function setItemStatus(item: IMigrationItem, status: MigrationItemStatus) {
  return await setItem(item, { status })
}

async function loadMigration(id: string) {
  return await Migration.mongoose.model.findById(id)
}

async function setMigrationStatus(migration: IMigration, status: MigrationStatus) {
  return await Migration.mongoose.model.findByIdAndUpdate(migration._id, { status }, { returnDocument: `after` })
}

function loadQueued(migration: IMigration) {
  const fetchItems = async () => {
    return await MigrationItem.mongoose.model
      .find({ migration: migration._id, status: MigrationItemStatus.QUEUED })
      .populate(`migration`)
  }

  async function* doLoad() {
    const items = await fetchItems()
    while (items.length) {
      if (items.length < 2) {
        items.push(...await fetchItems())
      }
      yield items.pop()
    }
  }

  return doLoad()
}

async function createEntity<E extends Entity = Entity>(entityTypeId: string, body: E) {
  const { baseURI } = useAppConfig().entityTypes[entityTypeId]
  const headers = getAuthHeaders()
  return await $fetch<EntityJSON>(baseURI, { method: `POST`, body: { ...body, status: Status.MIGRATED }, headers })
}

// REFACTOR: Leverage Migration API instead of Document models.
export default defineTask({
  meta: {
    name: `migrate:import`,
    description: `Import a migration`,
  },
  async run({ payload }) {
    const { migration: migrationID } = payload as { migration: string }
    if (!migrationID) {
      throw new Error(`No migration provided`)
    }

    const migration = await loadMigration(migrationID)
    if (!migration) {
      throw new Error(`Migration ${migrationID} not found`)
    }
    const entityTypeID = migration.entityType.split(`.`)[0]

    async function cycle() {
      const queue = loadQueued(migration!)
      let item = await queue.next()
      while (!item.done && item.value) {
        await setItemStatus(item.value, MigrationItemStatus.PENDING)
        await doImport(item.value)
        item = await queue.next()
      }
      await Migration.mongoose.model.findByIdAndUpdate(migration!._id, { status: MigrationStatus.IDLE })
      consola.log(`Done!`)
    }

    const imported: number[] = []
    async function doImport(item: IMigrationItem) {
      if (!imported.includes(item.sourceID)) {
        imported.push(item.sourceID)
      } else {
        return
      }

      try {
        const body = (await callHook(`migrate:import:item`, [item], { parallel: true })).reduceRight((acc, val) => ({ ...acc, ...val }), {})
        const { self } = await createEntity(entityTypeID, body)
        await callHook(`migrate:import:item:imported`, [await setItem(item, { status: MigrationItemStatus.IMPORTED, entityURI: self })])
        await Migration.mongoose.model.findByIdAndUpdate(migration!._id, { $inc: { imported: 1 } })
        consola.success(`Imported ${item.sourceID}`, self)
      } catch (err: unknown) {
        await callHook(`migrate:import:item:error`, [await setItem(item, { status: MigrationItemStatus.ERRORED, error: (err as Error).message })])
        await Migration.mongoose.model.findByIdAndUpdate(migration!._id, { $inc: { errored: 1 } })
        consola.error(`Failed to import ${item.sourceID}`, (err as Error).message)
      }
    }

    useHook(`migrate:import:item:wait`, async (item) => {
      consola.info(`Waiting for item ${item.sourceID}`)
      const migrationItem = await MigrationItem.mongoose.model.findById(item._id).populate(`migration`)
      if (migrationItem) {
        await doImport(migrationItem)
      }
    })

    consola.info(`Importing ${migration.name}`)
    await setMigrationStatus(migration, MigrationStatus.RUNNING)
    cycle()

    return { result: true }
  },
})
