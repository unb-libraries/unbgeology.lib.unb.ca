import { type EntityJSONList, FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { GeochronologicUnit } from "~/server/documentTypes/Geochronology"
import { getEntityQueryParams, getFilter } from "~/server/utils/api/query"
import type { Unit } from "~/types/geochronology"

const queryFields = [`self`, `label`, `division`, `start`, `gssp`, `uncertainty`, `color`, `parents`, `parents.id`, `parents.label`, `depth`, `status`, `created`, `updated`]

export default defineEventHandler(async (event) => {
  const { page, pageSize, search, select, sort, filter } = getEntityQueryParams(event, queryFields)

  const resources = getAuthorizedResources(event, r => /^terms(:geochronology)?(:[a-z]+)*$/.test(r))
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

  const query = Geochronology.mongoose.model
    .aggregate<{ documents: GeochronologicUnit[], total: [{ total: number }] }>()

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
  
  const [{ documents: terms, total: [{ total }] }] = await query
    .sort([...sort, ['label', 1]]
      .map(([field, dir]) => [field === `id` ? `_id` : field, dir])
      .reduce((sort, [field, order]) => ({ ...sort, [field]: order }), {}))
    .facet({
      documents: [
        { $skip: (Number(page) - 1) * Number(pageSize) },
        { $limit: Number(pageSize) }],
      total: [{ $count: `total` }] })
    .project({ documents: 1, total: 1 })

  return {
    self: `/api/terms/geochronology`,
    entities: terms
      .map<Unit>(renderUnit)
      .map(term => ({ ...term, parents: { self: `${term.self}/parents`, ...term.parents } }))
      .map(term => Object
        .fromEntries(Object
          .entries(term)
            .filter(([key]) => key === `self` || !selectFields.length || selectFields.includes(key)))),
    ...usePaginator({ total }),
  } as EntityJSONList<Unit>
})
