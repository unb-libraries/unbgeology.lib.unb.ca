import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

function queue(qid: string, options?: Partial<{ batchSize?: number }>) {
  const { batchSize = 1 } = options || {}

  const fetchItems = async () => {
    return await MigrationItem.mongoose.model
      .find({ queue: qid, status: MigrationItemStatus.QUEUED })
      .populate({ path: `migration`, populate: { path: `dependencies` } })
      .limit(batchSize)
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

// REFACTOR: Leverage Migration API instead of Document models.
export default defineTask({
  meta: {
    name: `migrate:import`,
    description: `Batch import migration items`,
  },
  async run({ payload }) {
    const { qid, options: { fetch = $fetch, batchSize = 100 } } = payload as { qid: string, options: { fetch: typeof $fetch, batchSize?: number } }

    const nitro = useNitroApp()

    await MigrationItem.mongoose.model.updateMany({ queue: qid }, { status: MigrationItemStatus.QUEUED })
    const q = queue(qid)

    async function next() {
      const item = (await q.next()).value
      if (item?.get(`status`) === MigrationItemStatus.QUEUED) {
        nitro.hooks.callHookParallel(`migrate:import:item`, item, { fetch })
      }
    }

    Array.from({ length: batchSize }).map(next)
    nitro.hooks.hook(`migrate:import:item:done`, next)
    nitro.hooks.hook(`migrate:import:item:wait`, (item) => {
      if (item.get(`status`) === MigrationItemStatus.QUEUED) {
        nitro.hooks.callHookParallel(`migrate:import:item`, item, { fetch })
      }
    })

    return { result: true }
  },
})
