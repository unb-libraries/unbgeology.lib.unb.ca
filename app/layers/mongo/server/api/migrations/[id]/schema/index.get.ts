import { ObjectId } from "mongodb"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { page, pageSize, select, sort } = getQueryOptions(event)

  const selectableFields = [`id`, `count`, `values`]
  const fields = (select.length && select.filter(field => selectableFields.includes(field))) || selectableFields

  const ranking = Object.fromEntries(sort
    .concat([[`id`, true]])
    .filter(([id], i, arr) => arr.findIndex(([i]) => i === id) === i)
    .filter(([id]) => [`id`, `count`].includes(id))
    .map<[string, 1 | -1]>(([id, asc]) => [id === `id` ? `_id` : id, asc ? 1 : -1]))

  const [{ keys, total: [total] }] = await MigrationItem.mongoose.model.aggregate<{ keys: { _id: string, count: number }[], total: number[] }>()
    .match({ migration: new ObjectId(id) })
    .project({ dataArray: { $objectToArray: `$data` } })
    .unwind(`$dataArray`)
    .group({ _id: `$dataArray.k`, count: { $sum: 1 } })
    .facet({
      keys: [
        { $sort: (Object.keys(ranking).length && ranking) || { _id: 1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
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
    entities: keys.map(({ _id: id, count }) => ({
      self: `${pathname}/${id}`,
      id: (fields.includes(`id`) && id) || undefined,
      count: (fields.includes(`count`) && count) || undefined,
      values: (fields.includes(`values`) && {
        self: `${pathname}/${id}/values`,
      }) || undefined,
    })),
    nav,
    page,
    pageSize,
    total,
  }
})
