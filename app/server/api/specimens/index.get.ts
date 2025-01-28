import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { Specimen as ISpecimen } from "~/types/specimen"
import { renderSpecimen } from "~/server/documentTypes/Specimen"
import { getSpecimenRequestCacheId } from "~/server/utils/cache"

const cacheOptions: Parameters<typeof defineCachedEventHandler>[1] = {
  name: `specimens`,
  maxAge: 0,
  varies: [`Cookie`],
  getKey: getSpecimenRequestCacheId,
}

export default defineCachedEventHandler(async (event) => {
  const { filter, page, pageSize, select, search, sort } = getSpecimenQueryParams(event)
  
  const resources = getAuthorizedResources(event, r => /^specimen(:\w)*$/.test(r))
  const authFields = getAuthorizedFields(event, ...resources)
  const fields = select?.filter(field => !authFields.length || authFields.includes(field))
  if (!resources.length) {
    return create403()
  }

  const query = Specimen.Base.mongoose.model
    .aggregate()
  
  if (search)  {
    query.match({ $text: { $search: search } })
    query.addFields({ score: { $meta: `textScore` } })
    if (!sort.length) {
      sort.push([`score`, -1])
    }
    fields.push(`score`)
  }

  // Populate and filter by classification
  if (fields.some(f => f.startsWith(`classification`))) {
    query.lookup({
      from: 'terms',
      localField: 'classification',
      foreignField: '_id',
      as: 'classification'
    })
    query.unwind({ path: `$classification`, preserveNullAndEmptyArrays: true })
    query.addFields({ noclassification: { $cond: { if: { $ne: [`$classification`, null] }, then: true, else: false } } })
  }

  // Join and filter by images
  if (fields.some(f => f.startsWith(`images`))) {
    query.lookup({ from: `files`, localField: `images`, foreignField: `_id`, as: `images` })
  }

  // Join and filter by collection
  if (fields.some(f => f.startsWith(`collection`))) {
    query.lookup({ from: `terms`, localField: `kollektion`, foreignField: `_id`, as: `kollektion` })
    query.unwind({ path: `$kollektion`, preserveNullAndEmptyArrays: true })
  }

  // Join and filter by age
  if (fields.some(f => f.startsWith(`age`))) {
    query.lookup({ from: `terms`, localField: `relativeAge`, foreignField: `_id`, as: `relativeAge` })
  }

  // Join and filter by composition
  if (fields.some(f => f.startsWith(`composition`))) {
    query.lookup({ from: `terms`, localField: `composition`, foreignField: `_id`, as: `composition` })
  }

  // Join and filter by collector
  if (fields.some(f => f.startsWith(`collector`))) {
    query.lookup({ from: `terms`, localField: `collector`, foreignField: `_id`, as: `collector` })
    query.unwind({ path: `$collector`, preserveNullAndEmptyArrays: true })
  }
  
  // Join and filter by sponsor
  if (fields.some(f => f.startsWith(`sponsor`))) {
    query.lookup({ from: `terms`, localField: `sponsor`, foreignField: `_id`, as: `sponsor` })
    query.unwind({ path: `$sponsor`, preserveNullAndEmptyArrays: true })
  }

  // Join and filter by storage
  if (fields.some(f => f.startsWith(`storage`))) {
    query.lookup({ from: `terms`, localField: `storage`, foreignField: `_id`, as: `storage` })
  }

  // Join and filter by creator
  if (fields.some(f => f.startsWith(`creator`))) {
    query.lookup({ from: `users`, localField: `creator`, foreignField: `_id`, as: `creator` })
    query.unwind({ path: `$creator`, preserveNullAndEmptyArrays: true })
  }

  // Join and filter by editor
  if (fields.some(f => f.startsWith(`editor`))) {
    query.lookup({ from: `users`, localField: `editor`, foreignField: `_id`, as: `editor` })
    query.unwind({ path: `$editor`, preserveNullAndEmptyArrays: true })
  }

  // Apply non-joined-collection filters
  const categoryFilter = filter?.find(([field, op, values]) => field === `type` && Number(op) === FilterOperator.EQUALS && typeof values === `string`)
  if (categoryFilter) {
    // console.log(`categoryFilter`, titleCased(categoryFilter[2]!))
    query.match({ type: `Specimen.${categoryFilter[2]!.charAt(0).toUpperCase() + categoryFilter[2]!.slice(1)}` })
  }

  const [{ documents: specimens, total: [{ total }] }] = await query
    .match({ authTags: { $in: resources } })
    .sort([...sort, [`id`, -1]]
      .map(([field, dir]) => [(() => {
        switch (field) {
          case `id`: return `slug`
          case `classification`: return `classification.label`
          case `collection`: return `kollektion.label`
          case `creator`: {
            query.addFields({ creator: { sortKey: {
              $cond: {
                if: { $and: [`$creator.profile.firstName`, `$creator.profile.lastName`] },
                then: { $concat: [`$creator.profile.firstName`, ` `, `$creator.profile.lastName`] },
                else: `$creator.username`
              }
            } } })
            return `creator.profile.sortKey`
          }
          case `editor`: {
            query.addFields({ editor: { sortKey: {
              $cond: {
              if: { $and: [`$editor.profile.firstName`, `$editor.profile.lastName`] },
              then: { $concat: [{ $toLower: `$editor.profile.firstName` }, ` `, { $toLower: `$editor.profile.lastName` }] },
              else: { $toLower: `$editor.username` }
              }
            } } })
            return `editor.profile.sortKey`
          }
          default: return field
        }
      })(), dir])
      .map(([field, dir]) => `${dir === -1 ? `-` : ``}${field}`)
      .join(` `))
    .facet({ documents: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }], total: [{ $count: `total` }] })
    .project({ documents: 1, total: 1 })

  return {
    self: `/api/specimens`,
    entities: specimens
      .map(renderSpecimen)
      .map(specimen => Object
        .fromEntries(Object
          .entries(specimen)
            .filter(([key]) => key === `self` || !fields.length || fields.includes(key as keyof ISpecimen)))),
    ...usePaginator({ total }),
  }
}, cacheOptions)
