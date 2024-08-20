import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

function queue(qid: string, options?: Partial<{ batchSize: number }>) {
  const { batchSize = 1 } = options || {}
  let batch = 1

  const fetchItems = async (batch: number) => {
    return await MigrationItem.mongoose.model.find()
      .where(`queue`).equals(qid)
      .populate({ path: `migration`, populate: { path: `dependencies` } })
      .sort(`sourceID`)
      .skip((batch - 1) * batchSize)
      .limit(batchSize)
  }

  async function* doLoad() {
    const items = await fetchItems(batch++)
    while (items.length) {
      if (items.length < 2) {
        items.push(...await fetchItems(batch++))
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
    const { qid, options: { fields = [], fetch = $fetch, batchSize = 100 } } = payload as { qid: string, options: { fields: string[], fetch: typeof $fetch, batchSize?: number } }

    const nitro = useNitroApp()

    await MigrationItem.mongoose.model.updateMany({ queue: qid }, { status: MigrationItemStatus.QUEUED })
    nitro.hooks.callHook(`migrate:queue`, qid)
    const q = queue(qid)

    async function next() {
      const item = (await q.next()).value
      if (item?.get(`status`) === MigrationItemStatus.QUEUED) {
        nitro.hooks.callHookParallel(`migrate:import:item`, item, { fetch, fields })
      } else if (!item) {
        const remaining = await MigrationItem.mongoose.model.countDocuments({ queue: qid, status: { $in: [MigrationItemStatus.QUEUED, MigrationItemStatus.PENDING] } })
        if (!remaining) {
          nitro.hooks.callHook(`migrate:queue:done`, qid)
        }
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
