import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id, qid } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r), { action: `update` })
  const migration = await Migration.mongoose.model.findById(id).select(`authTags`)
  if (!migration) {
    return create404()
  } else if (!resources.length || !migration.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  const docs = (await MigrationItem.mongoose.model.aggregate([
    { $match: { queue: qid } },
    { $group: { _id: `$status`, count: { $sum: 1 } } },
  ])).map<{ [s: string]: number }>(({ _id: status, count }) => ({ [status]: count }))
    .reduce((acc, doc) => ({ ...acc, ...doc }), {})

  if (Object.values(docs).length === 0) {
    return create404()
  }

  const tally = useEnum(MigrationItemStatus)
    .toTuples()
    .map<[string, number]>(([status, label]) => [label.toLowerCase(), docs[status] ?? 0])

  return {
    self: getRequestURL(event).pathname,
    id: qid,
    items: tally.reduce((acc, [, count]) => acc + count, 0),
    ...Object.fromEntries(tally),
  }
})
