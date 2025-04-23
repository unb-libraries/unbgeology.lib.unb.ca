import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import type { Specimen as ISpecimen } from "~/types/specimen"
import { renderSpecimen, type Specimen } from "~/server/documentTypes/Specimen"
import { getSpecimenRequestCacheId } from "~/server/utils/cache"
import type { GeochronologicUnit } from '~/server/documentTypes/Geochronology'
import type { Classification } from '~/server/documentTypes/Classification'

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
      .flat()
  }
  
  function getBoundsFilter(op: FilterOperator) {
    return getFilter('origin', op)?.map(b => b.split(`;`)).flat().map(Number) as [number, number] | undefined
  }
  
  const queryFilter = {
    type: getFilter('type', FilterOperator.EQUALS)?.map(c => `Specimen.${c[0].toUpperCase() + c.slice(1).toLowerCase()}`),
    classification: getFilter('classification', FilterOperator.EQUALS)?.map(c => c.split(`/`).at(-1)).map(parseObjectID),
    age: getFilter('age.relative', FilterOperator.EQUALS)?.map(c => c.split(`/`).at(-1)).map(parseObjectID),
    origin: [getBoundsFilter(FilterOperator.GREATER), getBoundsFilter(FilterOperator.LESS)].filter(b => (b ?? []).length > 0) as [number, number][],
    search,
  }

  const query = Specimen.Base.mongoose.model.aggregate<{ specimens: Specimen[], count: [{ total: number }], facets: Record<string, { _id: unknown, count: number }[]> }>()
  if (Object.values(queryFilter).filter(f => (f ?? []).length > 0).length) {
    query.search({
      index: 'autocomplete',
      compound: {
        should: (queryFilter.search && [
          { equals: { value: queryFilter.search, path: 'slug', score: { boost: { value: 3 } } } },
          { equals: { value: queryFilter.search, path: 'name', score: { boost: { value: 3 } } } },
          { text: { query: queryFilter.search, path: 'name', score: { boost: { value: 2 }} } },
          { autocomplete: { query: queryFilter.search, path: 'slug' } },
          { autocomplete: { query: queryFilter.search, path: 'name' } },
          { text: { query: queryFilter.search, path: 'origin.name' } },
          { autocomplete: { query: queryFilter.search, path: 'origin.name' } },
          { text: { query: queryFilter.search, path: 'origin.description' } },
          { autocomplete: { query: queryFilter.search, path: 'origin.description' } },
          { phrase: { query: queryFilter.search, path: 'description' } },
        ]) || [],
        filter: [
          queryFilter.type.length && {
            queryString: {
              defaultPath: 'type',
              query: queryFilter.type.join(` OR `),
            },
          },
          queryFilter.classification.length && {
            in: {
              path: 'classification',
              value: queryFilter.classification,
            },
          },
          queryFilter.age.length && {
            in: {
              path: 'relativeAge',
              value: queryFilter.age,
            },
          },
          // TODO: Convert this to a geo filter (geoWithin); requires origin to contain a "GeoJSON" point
          queryFilter.origin.length === 2 && {
            compound: {
              filter: [
                {
                  range: {
                    path: 'origin.latitude',
                    lte: queryFilter.origin[0][0],
                    gte: queryFilter.origin[1][0],
                  },
                },
                {
                  range: {
                    path: 'origin.longitude',
                    lte: queryFilter.origin[0][1],
                    gte: queryFilter.origin[1][1],
                  },
                }
              ]
            }
          },
          // TODO: Filter by age
          // TODO: Filter by storage location (public/private)
        ].filter(Boolean),
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

  // TODO: Make this conditional, introduce facet query parameter
  // if (fields.some(f => f.startsWith(`classification`))) {
    query.lookup({ from: `terms`, localField: `classification`, foreignField: `_id`, as: `classification` })
    query.unwind({ path: `$classification`, preserveNullAndEmptyArrays: true })
  // }
  if (fields.some(f => f.startsWith(`images`))) {
    query.lookup({ from: `files`, localField: `images`, foreignField: `_id`, as: `images` })
  }
  if (fields.some(f => f.startsWith(`collection`))) {
    query.lookup({ from: `terms`, localField: `kollektion`, foreignField: `_id`, as: `kollektion` })
    query.unwind({ path: `$kollektion`, preserveNullAndEmptyArrays: true })
  }
  // TODO: Make this conditional, introduce facet query parameter
  // if (fields.some(f => f.startsWith(`age`))) {
    query.lookup({ from: `terms`, localField: `relativeAge`, foreignField: `_id`, as: `relativeAge` })
  // }
  if (fields.some(f => f.startsWith(`composition`))) {
    query.lookup({ from: `terms`, localField: `composition`, foreignField: `_id`, as: `composition` })
  }
  if (fields.some(f => f.startsWith(`collector`))) {
    query.lookup({ from: `terms`, localField: `collector`, foreignField: `_id`, as: `collector` })
    query.unwind({ path: `$collector`, preserveNullAndEmptyArrays: true })
  }
  if (fields.some(f => f.startsWith(`sponsor`))) {
    query.lookup({ from: `terms`, localField: `sponsor`, foreignField: `_id`, as: `sponsor` })
    query.unwind({ path: `$sponsor`, preserveNullAndEmptyArrays: true })
  }
  // TODO: Make this conditional, introduce facet query parameter
  // if (fields.some(f => f.startsWith(`storage`))) {
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
    if (fields.some(f => f.startsWith(`storage.location.public`))) {
      query.match({ 'currentStorage.location.public': true })
    }
  // }
  if (fields.some(f => f.startsWith(`creator`))) {
    query.unwind({ path: `$creator`, preserveNullAndEmptyArrays: true })
    query.lookup({ from: `terms`, localField: `creator`, foreignField: `_id`, as: `creator` })
    query.addFields({
      creator: {
        sortKey: {
          $cond: {
            if: { $and: [`$creator.profile.firstName`, `$creator.profile.lastName`] },
            then: { $concat: [`$creator.profile.firstName`, ` `, `$creator.profile.lastName`] },
            else: `$creator.username`
          },
        },
      }
    })
  }
  if (fields.some(f => f.startsWith('editor'))) {
    query.lookup({ from: 'terms', localField: 'editor', foreignField: '_id', as: 'editor' })
    query.unwind({ path: `$editor`, preserveNullAndEmptyArrays: true })
    query.addFields({
      editor: {
        sortKey: {
          $cond: {
            if: { $and: [`$editor.profile.firstName`, `$editor.profile.lastName`] },
            then: { $concat: [{ $toLower: `$editor.profile.firstName` }, ` `, { $toLower: `$editor.profile.lastName` }] },
            else: { $toLower: `$editor.username` },
          },
        },
      },
    })
  }
  
  const [{ specimens, count: [{ total }], facets }] = await query
    .facet({
      specimens: [
        {
          $sort: Object.fromEntries(([...sort, [`id`, -1]])
            .map(([field, dir]) => [(() => {
              switch (field) {
                case `id`: return `slug`
                case `classification`: return `classification.label`
                case `collection`: return `kollektion.label`
                case `creator`: return `creator.profile.sortKey`
                case `editor`: return `editor.profile.sortKey`
                default: return field
              }
            })(), dir])) as Record<keyof ISpecimen, -1 | 1>,
        },
        // REFACTOR: Find a better solution for this (maybe front in end)
        !queryFilter.origin.length && { $skip: (page - 1) * pageSize },
        !queryFilter.origin.length && { $limit: pageSize },
      ].filter(Boolean),
      count: [{ $count: `total` }],
      categoryFacet: [
        { $sortByCount: `$type` },
        { $addFields: { _id: { $substr: ['$_id', 'Specimen.'.length, 50] } } },
      ],
      classificationFacet: [
        { $match: { classification: { $exists: 1 } } },
        { $sortByCount: `$classification` },
        { $project: { _id: { _id: 1, label: 1, type: 1 }, count: 1 } },
        { $sort: { count: -1, '_id.label': 1 } },
      ],
      ageFacet: [
        { $unwind: { path: `$relativeAge` } },
        { $match: { relativeAge: { $exists: 1 } } },
        { $sortByCount: `$relativeAge` },
        { $project: { _id: { _id: 1, label: 1, division: 1 }, count: 1 } },
        { $sort: { count: -1, '_id.label': 1 } },
      ],
      // TODO: Account for storage ancestors "public" property
      onDisplayFacet: [
        { $match: { 'currentStorage.location.public': true } },
        { $sortByCount: `$currentStorage.location.public` },
      ],
    })
    .addFields({ facets: { age: `$ageFacet`, category: `$categoryFacet`, classification: `$classificationFacet`, onDisplay: `$onDisplayFacet` } })
    .project({ specimens: 1, count: 1, facets: 1 })

  return {
    self: `/api/specimens`,
    facets: {
      category: facets.category.map(({ _id: type, count }) => ({
        value: {
          id: `${type}`.toLowerCase(),
          label: type,
        },
        count,
      })),
      classification: facets.classification.map(({ _id: classification, count }) => ({
        value: renderClassification(classification as Classification),
        count })),
      age: facets.age.map(({ _id: unit, count }) => ({ value: renderUnit(unit as GeochronologicUnit), count })),
      onDisplay: facets.onDisplay.map(({ _id: onDisplay, count }) => ({
        value: onDisplay ? true : false,
        count,
      })),
    },
    entities: specimens
      .map(renderSpecimen)
      .map(specimen => Object
        .fromEntries(Object
          .entries(specimen)
            .filter(([key]) => key === `self` || !selectFields.length || selectFields.includes(key as keyof ISpecimen)))),
    ...usePaginator({ total }),
  }
}, cacheOptions)
