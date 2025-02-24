import { type EntityJSONList, FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { Classification } from "~/server/documentTypes/Classification"
import { getEntityQueryParams, getFilter } from "~/server/utils/api/query"

const queryFields = [`self`, `label`, `rank`, `composition`, `parents`, `parents.id`, `parents.label`, `depth`, `status`, `created`, `updated`, `type`]

export default defineEventHandler(async (event) => {
  const { page, pageSize, search, select, sort, filter } = getEntityQueryParams(event, queryFields)

  const resources = getAuthorizedResources(event, r => /^terms(:classifications(:\w)*)$/.test(r))
  const authFields = getAuthorizedFields(event, ...resources)
  
  const sortFields = sort
    ?.map(([field]) => field)
    .filter((field, i, arr) => arr.indexOf(field) === i)
    .filter(field => !authFields.length || authFields.includes(field)) ?? []
  const selectFields = select
    ?.filter((field, i, arr) => arr.indexOf(field) === i)
    .filter(field => !authFields.length || authFields.includes(field)) ?? []
  const filterFields = filter
    ?.map(([field]) => field)
    .filter((field, i, arr) => arr.indexOf(field) === i)
    .filter(([field]) => !authFields.length || authFields.includes(field)) ?? []

  const query = Term.mongoose.model
    .aggregate<{ documents: Classification[], total: [{ total: number }] }>()

  if (search) {
    query.match({ $text: { $search: search } })
    query.addFields({ score: { $meta: `textScore` } })
    if (!sort.length) {
      sort.push([`score`, -1])
    }
    selectFields.push(`score`)
  }

  
  const fields = [...selectFields, ...sortFields, ...filterFields].filter((f, i, arr) => arr.indexOf(f) === i)
  if (fields.filter(f => f.startsWith(`parents`)).length) {
    query.lookup({
      from: 'terms',
      localField: 'ancestors',
      foreignField: '_id',
      as: 'ancestors'
    })
  }

  const label = getFilter(`label`, FilterOperator.EQUALS | FilterOperator.MATCH)(filter)
  if (label.length) {
    const match = getFilter(`label`, FilterOperator.MATCH)(filter)
    if (match.length) {
      query.match({ label: { $regex: match.at(-1) } })
    } else {
      const equals = getFilter(`label`, FilterOperator.EQUALS)(filter)
      query.match({ label: equals.length <= 1 ? equals[0] : { $in: equals } })
    }
  }
  
  const type = getFilter(`type`, FilterOperator.EQUALS)(filter).filter(t => t.match(/^classification\/(fossil|mineral|rock)/)).map(t => t.split('/')[1]).map(t => `Term.C${t.charAt(0).toUpperCase()}${t.slice(1)}`)
  if (type.length) {
    query.match({ type: type.length <= 1 ? type[0] : { $in: type } })
  } else {
    query.match({ type: { $in: ['Fossil', 'Mineral', 'Rock'].map(t => `Term.C${t}`) } })
  }

  const depth = getFilter(`depth`, FilterOperator.EQUALS)(filter).map(Number)
  if (depth.length) {
    query
      .addFields({ ancestorCount: { $size: '$ancestors' } })
      .match({ ancestorCount: depth.at(-1) })
  }

  const [{ documents: terms, total: [total = 0] }] = await query
    .sort([...sort, ['label', 1]]
      .map(([field, dir]) => [field === `id` ? `_id` : field, dir])
      .reduce((sort, [field, order]) => ({ ...sort, [field]: order }), {}))
    .facet({ documents: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }], total: [{ $count: `count` }] })
    .project({ documents: 1, total: { $ifNull: ["$total.count", 0]} })

  return {
    self: `/api/terms/classifications`,
    entities: terms
      .map(renderClassification)
      .map(term => ({ ...term, parents: { self: `${term.self}/parents`, ...term.parents } }))
      .map(term => Object
        .fromEntries(Object
          .entries(term)
            .filter(([key]) => key === `self` || !selectFields.length || selectFields.includes(key)))),
    ...usePaginator({ total }),
  } as EntityJSONList<Classification>
})
