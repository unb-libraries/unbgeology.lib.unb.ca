import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { getSpecimenRequestCacheId } from "~/server/utils/cache"
import type { Classification } from '~/server/documentTypes/Classification'

const cacheOptions: Parameters<typeof defineCachedEventHandler>[1] = {
  name: `specimens`,
  maxAge: 0,
  varies: [`Cookie`],
  shouldBypassCache: () => true,
  getKey: getSpecimenRequestCacheId,
}

export default defineCachedEventHandler(async (event) => {
  const { filter, select, search, sort } = getSpecimenQueryParams(event)
  
  const resources = getAuthorizedResources(event, r => /^specimen(:[a-z]+)*$/.test(r))
  const authFields = getAuthorizedFields(event, ...resources)
  
  const selectFields = select
    ?.filter((field, i, arr) => arr.indexOf(field) === i)
    .filter(field => !authFields.length || authFields.includes(field)) ?? []
  
  if (!resources.length) {
    return create403()
  }

  function getFilter(field: string, operator: FilterOperator) {
    return filter
      ?.filter(([f, op, value]) => f === field && useEnum(FilterOperator).valueOf(op) & operator && value)
      .map(([,,c]) => Array.isArray(c) ? c : [c])
      .flat()
  }
  
  function getNumericAgeFilter() {
    return getFilter('age.numeric', FilterOperator.EQUALS)?.map(c => c.split(',').map(Number)) ?? []
  }

  const queryFilter = {
    type: getFilter('type', FilterOperator.EQUALS)?.map(c => `Specimen.${c[0].toUpperCase() + c.slice(1).toLowerCase()}`),
    classification: getFilter('classification', FilterOperator.EQUALS)?.map(c => c.split(`/`).at(-1)).map(parseObjectID),
    age: getFilter('age.relative', FilterOperator.EQUALS)?.map(c => c.split(`/`).at(-1)).map(parseObjectID),
    ageNumeric: getNumericAgeFilter(),
    origin: getFilter('origin', FilterOperator.EQUALS).map(Boolean),
    onDisplay: getFilter('storage.location.public', FilterOperator.EQUALS).map(Boolean),
    search,
  }

  type Facet = { _id: unknown, count: number }[]
  const query = Specimen.Base.mongoose.model.aggregate<{ category: Facet, classification: Facet, age: Facet, numericAge: Facet, onDisplay: Facet }>()
  if (queryFilter.search) {
    query.search({
      index: 'autocomplete',
      compound: {
        should: [
          { equals: { value: queryFilter.search, path: 'slug', score: { boost: { value: 3 } } } },
          { equals: { value: queryFilter.search, path: 'name', score: { boost: { value: 3 } } } },
          { text: { query: queryFilter.search, path: 'name', score: { boost: { value: 2 }} } },
          { autocomplete: { query: queryFilter.search, path: 'slug' } },
          { autocomplete: { query: queryFilter.search, path: 'name' } },
          { text: { query: queryFilter.search, path: 'origin.name' } },
          { autocomplete: { query: queryFilter.search, path: 'origin.name' } },
          { phrase: { query: queryFilter.search, path: 'description' } },
        ],
      },
    })
    
    if (queryFilter.search) {
      // @ts-ignore
      sort.push([`score`, -1])
      selectFields.push(`score`)
      query.addFields({ score: { $meta: 'searchScore' } })
    }
  }

  query.match({ authTags: { $in: resources } })
  if (queryFilter.origin.length) {
    query.match({
      'origin.latitude': { $ne: null },
      'origin.longitude': { $ne: null },
      $or: [
        { 'origin.latitude': { $ne: 0 } },
        { 'origin.longitude': { $ne: 0 } },
      ],
    })
  }

  if (queryFilter.type.length) {
    query.match({ type: { $in: queryFilter.type } })
  }

  query.lookup({ from: `terms`, localField: `classification`, foreignField: `_id`, as: `classification` })
  query.unwind({ path: `$classification`, preserveNullAndEmptyArrays: true })

  if (queryFilter.classification.length) {
    query.match({ $or: [
      { 'classification._id': { $in: queryFilter.classification } },
      { 'classification.ancestors': { $in: queryFilter.classification } },
    ] })
  }
  
  query.lookup({ from: `terms`, localField: `relativeAge`, foreignField: `_id`, as: `relativeAge` })
  if (queryFilter.age.length) {
    query.match({ $or: [
      { 'relativeAge._id': { $in: queryFilter.age } },
      { 'relativeAge.ancestors': { $in: queryFilter.age } },
    ] })
  }
  
  query.addFields({ 'numericAge': { $ifNull: ['$numericAge', '$relativeAge.start'] } })
  query.addFields({ 'numericMin': { $min: '$numericAge' }, 'numericMax': { $max: '$numericAge' } })
  if (queryFilter.ageNumeric.length) {
    query.match({ $or: queryFilter.ageNumeric.map(([lower, upper]) => upper
      ? ({ $or: [{ numericMax: { $gte: lower }, numericMin: { $lt: upper } }] })
      : ({ numericMin: { $gte: lower } })) })
  }
  
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

  query.addFields({ currentStorage: { $arrayElemAt: ["$storage", { $subtract: [{ $size: "$storage" }, 1] }] } })
  if (queryFilter.onDisplay.length) {
    query.match({ 'currentStorage.location.public': true })
  }

  const [{ age, numericAge, category, classification, onDisplay }] = await query
    .facet({
      categoryFacet: [
        { $sortByCount: `$type` },
        { $addFields: { _id: { $substr: ['$_id', 'Specimen.'.length, 50] } } },
      ],
      classificationFacet: [
        { $match: { classification: { $exists: 1 } } },
        { $lookup: { from: 'terms', localField: 'classification.ancestors', foreignField: '_id', as: 'classifications' } },
        { $project: { classifications: { $setUnion: [ ['$classification'], '$classifications'] } } },
        { $unwind: { path: '$classifications' } },
        { $sortByCount: `$classifications` },
        { $project: { _id: { _id: 1, label: 1, type: 1 }, count: 1 } },
        { $sort: { count: -1, '_id.label': 1 } },
      ],
      ageFacet: [
        { $match: { relativeAge: { $exists: 1, $ne: null, $not: { $size: 0 } } } },
        { $lookup: { from: 'terms', localField: 'relativeAge.ancestors', foreignField: '_id', as: 'relativeAges' } },
        { $project: { relativeAges: { $setUnion: [ '$relativeAge', '$relativeAges'] } } },
        { $unwind: { path: '$relativeAges' } },
        { $sortByCount: `$relativeAges` },
        { $project: { _id: { _id: 1, label: 1, division: 1 }, count: 1 } },
        { $sort: { count: -1, '_id.label': 1 } },
      ],
      // Cenozoic
      numericAgeFacet66: [
        { $match: { numericMin: { $lt: 66000000 } } },
        { $group: { _id: [0, 66000000], count: { $count: {} } } },
      ],
      // Mesozoic
      numericAgeFacet251: [
        { $match: { numericMax: { $gte: 66000000 }, numericMin: { $lt: 251902000 } } },
        { $group: { _id: [66000000, 251902000], count: { $count: {} } } },
      ],
      // Paleozoic
      numericAgeFacet541: [
        { $match: { numericMax: { $gte: 251902000 }, numericMin: { $lt: 541000000 } } },
        { $group: { _id: [251902000, 541000000], count: { $count: {} } } },
      ],
      // Proterozoic
      numericAgeFacet2500: [
        { $match: { numericMax: { $gte: 541000000 }, numericMin: { $lt: 2500000000 } } },
        { $group: { _id: [541000000, 2500000000], count: { $count: {} } } },
      ],
      // Archean
      numericAgeFacet2500x: [
        { $match: { numericMax: { $gte: 2500000000 } } },
        { $group: { _id: [2500000000], count: { $count: {} } } },
      ],
      // TODO: Account for storage ancestors "public" property
      onDisplayFacet: [
        { $match: { 'currentStorage.location.public': true } },
        { $sortByCount: `$currentStorage.location.public` },
      ],
    })
    .project({
      age: `$ageFacet`,
      numericAge: { $setUnion: ['$numericAgeFacet66', '$numericAgeFacet251', '$numericAgeFacet541', '$numericAgeFacet2500', '$numericAgeFacet2500x'] },
      category: `$categoryFacet`,
      classification: `$classificationFacet`,
      onDisplay: `$onDisplayFacet`,
    })

  return {
    self: `/api/specimens`,
    entities: [
      {
        self: '/api/specimens/facets/category',
        entities: category.map(({ _id: type, count }) => ({
          value: {
            id: `${type}`.toLowerCase(),
            label: type,
          },
          count,
        })),
      },
      {
        self: '/api/specimens/facets/classification',
        entities: classification.map(({ _id: classification, count }) => ({
          value: renderClassification(classification as Classification),
          count,
        })),
      },
      {
        self: '/api/specimens/facets/age',
        entities: age.map(({ _id: unit, count }) => ({
          value: renderUnit(unit as GeochronologicUnit),
          count
        })),
      },
      {
        self: '/api/specimens/facets/numericAge',
        entities: numericAge.filter(({ count }) => count > 0).map(({ _id: bounds, count }) => ({
          value: bounds,
          count,
        })),
      },
      {
        self: '/api/specimens/facets/onDisplay',
        entities: onDisplay.map(({ _id: onDisplay, count }) => ({
          value: onDisplay ? true : false,
          count,
        })),
      }
    ],
    total: 5,
  }
}, cacheOptions)
