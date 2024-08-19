import { ObjectId } from "mongodb"

export default defineEventHandler(async (event) => {
  const { id, field } = getRouterParams(event)
  const { page, pageSize, select, sort } = getQueryOptions(event)

  const selectableFields = [`id`, `count`, `share`]
  const fields = (select.length && select.filter(field => selectableFields.includes(field))) || selectableFields

  const ranking = Object.fromEntries(sort
    .concat([[`id`, true]])
    .filter(([id], i, arr) => arr.findIndex(([i]) => i === id) === i)
    .filter(([id]) => [`id`, `count`].includes(id))
    .map<[string, 1 | -1]>(([id, asc]) => [id === `id` ? `_id` : id, asc ? 1 : -1]))

  const itemCount = await MigrationItem.mongoose.model.countDocuments({ migration: new ObjectId(id) })
  const [{ keys, total: [total] }] = await MigrationItem.mongoose.model.aggregate<{ keys: { _id: string, count: number, share: number }[], total: number[] }>()
    .match({ migration: new ObjectId(id) })
    .project({ dataArray: { $objectToArray: `$data` } })
    .unwind(`$dataArray`)
    .match({ "dataArray.k": field })
    .group({ _id: `$dataArray.v`, count: { $sum: 1 } })
    .facet({
      keys: [
        { $sort: (Object.keys(ranking).length && ranking) || { _id: 1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
        { $addFields: { share: { $divide: [`$count`, itemCount] } } },
      ],
      total: [
        { $group: { _id: null, count: { $sum: 1 } } },
      ],
    })
    .project({ keys: `$keys`, total: `$total.count` })

  const { nav } = usePaginator({ page, pageSize, total })
  const { pathname, search } = getRequestURL(event)

  return {
    self: [pathname, search].join(``),
    entities: keys.map(({ _id: id, count, share }) => ({
      self: `${pathname}/${id}`,
      id: (fields.includes(`id`) && `${id}`) || undefined,
      count: (fields.includes(`count`) && count) || undefined,
      share: (fields.includes(`share`) && share) || undefined,
    })),
    nav,
    page,
    pageSize,
    total,
  }
})
