import { type EntityJSONList, FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import Image from "#server/documentTypes/Image"
import type { Image as DImage } from "#server/documentTypes/Image"
import type { Image as EImage } from "@unb-libraries/nuxt-layer-entity"
import { getEntityQueryParams, getFilter } from "#server/utils/api/query"
import type { Specimen } from '~~/types/specimen'

const queryFields = [`self`, `filename`, `uri`, `specimens`, `status`, `created`, `updated`, `type`]

export default defineEventHandler(async (event) => {
  const { page, pageSize, select, sort, filter } = getEntityQueryParams(event, queryFields)

  const resources = getAuthorizedResources(event, r => /^file(:image)?(:[a-z]+)*$/.test(r))
  const authFields = getAuthorizedFields(event, ...resources)
  
  const selectFields = select
    ?.filter((field, i, arr) => arr.indexOf(field) === i)
    .filter(field => !authFields.length || authFields.includes(field)) ?? []
  const filterFields = filter
    ?.map(([field]) => field)
    .filter((field, i, arr) => arr.indexOf(field) === i)
    .filter(([field]) => !authFields.length || authFields.includes(field)) ?? []

  const query = Image.mongoose.model
    .aggregate<{ documents: DImage[], total: [{ total: number }] }>()

  const fields = [...selectFields, ...filterFields].filter((f, i, arr) => arr.indexOf(f) === i)
  if (fields.find(f => f.startsWith(`specimens`))) {
    query.lookup({ from: 'specimens', localField: '_id', foreignField: 'images', as: 'specimens' })
    query.unwind({ path: `$specimens`, preserveNullAndEmptyArrays: true })
    query.lookup({ from: 'terms', localField: 'specimens.classification', foreignField: '_id', as: 'specimens.classification' })
    query.unwind({ path: `$specimens.classification`, preserveNullAndEmptyArrays: true })
    
    query.group({ _id: '$_id', merged: { $mergeObjects: '$$ROOT' }, specimens: { $push: '$specimens' } })
    query.addFields({ 'merged.specimens': { $filter: { input: '$specimens', as: 'specimen', cond: { $ne: ['$$specimen', {}] } } } })
    query.replaceRoot('$merged')
  }

  const specimenClassificationFilter = getFilter(`specimens.classification`, FilterOperator.EQUALS)(filter).map(f => f.split('/').at(-1)).map(parseObjectID)
  if (specimenClassificationFilter.length) {
    query.match({ 'specimens.classification._id': specimenClassificationFilter.length > 1 ? { $in: specimenClassificationFilter } : specimenClassificationFilter[0] })
  }

  const specimenMinFilter = getFilter(`specimens.total`, FilterOperator.LESS)(filter)
  if (specimenMinFilter.length) {
    query.addFields({ specimenCount: { $size: `$specimens` } })
    query.match({ specimenCount: Math.min(...specimenMinFilter.map(Number)) })
  }
  
  const specimenMaxFilter = getFilter(`specimens.total`, FilterOperator.GREATER)(filter)
  if (specimenMaxFilter.length) {
    query.addFields({ specimenCount: { $size: { $ifNull: [`$specimens`, []] } } })
    query.match({ specimenCount: { $gte: Number(Math.max(...specimenMaxFilter)) } })
  }

  const [{ documents: images, total: [total = 0] }] = await query
    .sort([...sort, ['uploadName', 1]]
      .map(([field, dir]) => [field === `id` ? `_id` : field === `filename` ? `uploadName` : field, dir])
      .reduce((sort, [field, order]) => ({ ...sort, [field]: order }), {}))
    .facet({ documents: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }], total: [{ $count: `count` }] })
    .project({ documents: 1, total: { $ifNull: ["$total.count", 0]} })

  return {
    self: `/api/files/images`,
    entities: images
      .map<EImage & { specimens: EntityJSONList<EImage> }>(image => ({
        ...renderImageFile(image),
        specimens: {
          self: `/api/files/images/${image._id}/specimens`,
          entities: image.specimens?.slice(0, 5)
            .map(specimen => renderSpecimen(specimen))
            .map(({ self, name, classification, type }) => ({ self, name, classification: (classification && { self: classification.self, label: classification.label }) || undefined, type })) ?? [],
          page: 1,
          pageSize: 5,
          ...usePaginator({ total: image.specimens?.length ?? 0 }),
        },
      }))
      .map(image => Object
        .fromEntries(Object
          .entries(image)
            .filter(([key]) => key === 'self' || !selectFields.length || selectFields.includes(key))) as EImage),
    ...usePaginator({ total }),
  } as EntityJSONList<EImage & { specimens: EntityJSONList<Specimen> }>
})
