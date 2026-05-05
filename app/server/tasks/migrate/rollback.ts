import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"
import { Int32 } from "mongodb"

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

    const { QUEUED, PENDING } = MigrationItemStatus
    const nitro = useNitroApp()

    await MigrationItem.mongoose.model.updateMany({ queue: qid }, { $bit: { status: { or: new Int32(QUEUED) } } })
    const q = queue(qid)

    async function next() {
      const item = (await q.next()).value
      if (item && item.status & QUEUED) {
        await nitro.hooks.callHookParallel(`migrate:rollback:item`, item, { fetch })
      } else if (!item) {
        const remaining = await MigrationItem.mongoose.model.countDocuments({ queue: qid, status: { $bitsAnySet: QUEUED | PENDING } })
        !remaining && nitro.hooks.callHook(`migrate:queue:done`, qid)
      }
    }

    Array.from({ length: batchSize }).map(next)
    nitro.hooks.hook(`migrate:rollback:item:done`, next)
    return { result: true }
  },
})
