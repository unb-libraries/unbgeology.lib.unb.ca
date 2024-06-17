import { MigrationItemStatus, MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import { consola } from "consola"
import { type MigrationItem as IMigrationItem } from "../../documentTypes/MigrationItem"
import { type Migration as IMigration } from "../../documentTypes/Migration"

function getAuthHeaders(): { Cookie?: string } {
  const event = useEvent()
  if (event) {
    const sessionName = useRuntimeConfig().public.session.name
    return { Cookie: `${sessionName}=${getCookie(event, sessionName)}` }
  }
  return {}
}

async function loadMigration(id: string) {
  return await Migration.mongoose.model.findById(id)
}

async function setItem(item: IMigrationItem, values: Partial<IMigrationItem>) {
  return await MigrationItem.mongoose.model.findByIdAndUpdate(item._id, values, { returnDocument: `after` }).populate(`migration`)
}

async function setItemStatus(item: IMigrationItem, status: MigrationItemStatus) {
  return await setItem(item, { status })
}

function loadProcessed(migration: IMigration) {
  const fetchItems = async () => {
    return await MigrationItem.mongoose.model
      .find({ migration: migration._id, $or: [{ status: MigrationItemStatus.IMPORTED }, { status: MigrationItemStatus.ERRORED }] })
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

export default defineTask({
  meta: {
    name: `migrate:rollback`,
    description: `Rollback a migration`,
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

    async function cycle() {
      const queue = loadProcessed(migration!)
      let item = await queue.next()
      while (!item.done && item.value) {
        await setItemStatus(item.value, MigrationItemStatus.PENDING)
        await doRollback(item.value)
        item = await queue.next()
      }
      await Migration.mongoose.model.findByIdAndUpdate(migration!._id, { status: MigrationStatus.IDLE })
      consola.log(`Done!`)
    }

    async function doRollback(item: IMigrationItem) {
      const { entityURI } = item
      if (entityURI) {
        try {
          await $fetch(entityURI, { method: `DELETE`, headers: getAuthHeaders() })
        } catch (err: unknown) {
          consola.error(`Error deleting entity ${entityURI}`, (err as Error).message)
        }
      }

      await MigrationItem.mongoose.model.findByIdAndUpdate(item._id, {
        status: MigrationItemStatus.INITIAL,
        $unset: { entityURI: 1, error: 1 },
      })

      await Migration.mongoose.model.findByIdAndUpdate(item._id, {
        $inc: item.status === MigrationItemStatus.IMPORTED
          ? { imported: -1 }
          : { errored: -1 },
      })
    }

    consola.info(`Rollback ${migration.name}`)
    cycle()

    return { result: true }
  },
})
