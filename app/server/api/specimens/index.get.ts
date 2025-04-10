import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import type { Specimen as ISpecimen } from "~/types/specimen"
import { renderSpecimen, type Specimen } from "~/server/documentTypes/Specimen"
import { getSpecimenRequestCacheId } from "~/server/utils/cache"

const cacheOptions: Parameters<typeof defineCachedEventHandler>[1] = {
  name: `specimens`,
  maxAge: 0,
  varies: [`Cookie`],
  shouldBypassCache: () => true,
  getKey: getSpecimenRequestCacheId,
}

export default defineCachedEventHandler(async (event) => {
  const { filter, page, pageSize, select, search, sort } = getSpecimenQueryParams(event)
  
  const resources = getAuthorizedResources(event, r => /^specimen(:[a-z]+)*$/.test(r))
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
  const fields = [...selectFields, ...sortFields, ...filterFields]
  
  if (!resources.length) {
    return create403()
  }

  function getFilter(field: string, operator: FilterOperator) {
    return filter
      ?.filter(([f, op, value]) => f === field && useEnum(FilterOperator).valueOf(op) & operator && value)
      .map(([,,c]) => Array.isArray(c) ? c : [c])
      .flat() ?? []
  }

  const query = Specimen.Base.mongoose.model
    .aggregate<{ documents: Specimen[], total: [number] }>()
  
  if (search)  {
    query.search({
      index: 'autocomplete',
      compound: {
        should: [
          { equals: { value: search, path: 'name', score: { boost: { value: 3 } } } },
          { text: { query: search, path: 'name', score: { boost: { value: 2 }} } },
          { autocomplete: { query: search, path: 'name' } },
          { phrase: { query: search, path: 'description' } },
        ]
      }
    })
    
    query.addFields({ score: { $meta: `searchScore` } })
    if (!sort.length) {
      // @ts-ignore
      sort.push([`score`, -1])
    }
    selectFields.push(`score`)
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
    
    const classificationFilter = getFilter('classification', FilterOperator.EQUALS).map(c => c.split(`/`).at(-1)).map(parseObjectID)
    if (classificationFilter.length) {
      query.match({ 'classification._id': classificationFilter.length <= 1 ? classificationFilter[0] : { $in: classificationFilter } })
    }
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
    
    const anyAgeFilter = getFilter('age.numeric', FilterOperator.GREATER | FilterOperator.LESS | FilterOperator.EQUALS)
    if (anyAgeFilter.length) {
      query.addFields({ minAge: { $max: [`$relativeAge.start`, `$numericAge`] }, maxAge: { $min: [`$relativeAge.start`, `$numericAge`] } })
      // query.match({ 'age.relative._id': anyAgeFilter.length <= 1 ? anyAgeFilter[0] : { $in: anyAgeFilter } })
    }
    
    const minAgeFilter = getFilter('age.numeric', FilterOperator.GREATER | FilterOperator.EQUALS).map(Number)
    if (minAgeFilter.length) {
      query.match({ minAge: { $gte: Math.max(...minAgeFilter) } })
    }
    
    const maxAgeFilter = getFilter('age.numeric', FilterOperator.LESS | FilterOperator.EQUALS).map(Number)
    if (maxAgeFilter.length) {
      query.match({ maxAge: { $lte: Math.min(...maxAgeFilter) } })
    }
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
    query.lookup({ from: `terms`, localField: `storage.location`, foreignField: `_id`, as: `storageLocations` })
    query.addFields({
      storage: {
        $map: {
          input: "$storage",
          as: "s",
          in: {
            $mergeObjects: ["$$s", {
              location: {
                $arrayElemAt: [{
                  $filter: {
                    input: "$storageLocations",
                    as: "loc",
                    cond: { $eq: ["$$loc._id", "$$s.location"] },
                  } }, 0],
              } }]
          }
        }
    } })
    
    if (fields.includes(`storage.location.public`)) {
      query.addFields({ currentStorage: { $arrayElemAt: ["$storage", { $subtract: [{ $size: "$storage" }, 1] }] } })
      query.match({ "currentStorage.location.public": true })
    }
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
  //
  // Filter by type
  const categories = getFilter('type', FilterOperator.EQUALS).map(c => `Specimen.${c[0].toUpperCase() + c.slice(1).toLowerCase()}`) ?? []
  if (categories.length) {
    query.match({ type: categories.length > 1 ? { $in: categories } : categories[0] })
  }

  // Filter by origin (bounds)
  const getBoundsFilter = (op: FilterOperator) => getFilter('origin', op).map(b => b.split(`;`)).flat().map(Number) as [number, number]
  const bounds = [getBoundsFilter(FilterOperator.GREATER), getBoundsFilter(FilterOperator.LESS)].filter(b => b.length > 0)
  if (bounds.length === 2) {
    const [[neLat, neLong], [swLat, swLong]] = bounds
    query.match({ 
      "origin.latitude": { $lt: neLat, $gt: swLat },
      "origin.longitude": { $lt: neLong, $gt: swLong },
    })
  }

  const [{ documents: specimens, total: [total = 0] }] = await query
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
    .facet({ documents: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }], total: [{ $count: `count` }] })
    .project({ documents: 1, total: { $ifNull: ["$total.count", 0]} })

  return {
    self: `/api/specimens`,
    entities: specimens
      .map(renderSpecimen)
      .map(specimen => Object
        .fromEntries(Object
          .entries(specimen)
            .filter(([key]) => key === `self` || !selectFields.length || selectFields.includes(key as keyof ISpecimen)))),
    ...usePaginator({ total }),
  }
}, cacheOptions)
