import { ObjectId } from "mongodb"

export default defineEventHandler(async (event) => {
  const { id, field } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  const selectableFields = [`id`, `count`, `values`]
  const fields = (select.length && select.filter(field => selectableFields.includes(field))) || selectableFields

  const [{ _id, count }]: { _id: string, count: number }[] = await MigrationItem.mongoose.model.aggregate([
    { $match: { migration: new ObjectId(id) } },
    { $project: { dataArray: { $objectToArray: `$data` } } },
    { $unwind: `$dataArray` },
    { $group: { _id: `$dataArray.k`, count: { $sum: 1 } } },
    { $match: { _id: field } },
  ])

  const { pathname, search } = getRequestURL(event)
  return {
    self: [pathname, search].join(``),
    id: (fields.includes(`id`) && _id) || undefined,
    count: (fields.includes(`count`) && count) || undefined,
    values: (fields.includes(`values`) && {
      self: `${getRequestURL(event).pathname}/values`,
    }) || undefined,
  }
})
