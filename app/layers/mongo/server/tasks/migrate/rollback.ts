import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

function queue(qid: string, options?: Partial<{ batchSize?: number }>) {
  const { batchSize = 1 } = options || {}
  let batch = 1

  const fetchItems = async (batch: number) => {
    return await MigrationItem.mongoose.model
      .find({ queue: qid })
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

export default defineTask({
  meta: {
    name: `migrate:rollback`,
    description: `Rollback a migration`,
  },
  async run({ payload }) {
    const { qid, options: { fetch = $fetch, batchSize = 100 } } = payload as { qid: string, options: { fetch: typeof $fetch, batchSize?: number } }

    const nitro = useNitroApp()
    await MigrationItem.mongoose.model.updateMany({ queue: qid }, { status: MigrationItemStatus.QUEUED })
    const q = queue(qid)

    async function next() {
      const item = (await q.next()).value
      if (item?.status === MigrationItemStatus.QUEUED) {
        await nitro.hooks.callHookParallel(`migrate:rollback:item`, item, { fetch })
      }
    }

    Array.from({ length: batchSize }).map(next)
    return { result: true }
  },
})
