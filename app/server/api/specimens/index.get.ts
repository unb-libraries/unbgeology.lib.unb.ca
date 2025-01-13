import type { Specimen as ISpecimen } from "~/types/specimen"
import { renderSpecimen } from "~/server/documentTypes/Specimen"
import { getSpecimenRequestCacheId } from "~/server/utils/cache"

const cacheOptions: Parameters<typeof defineCachedEventHandler>[1] = {
  name: `specimens`,
  maxAge: 60 * 60 * 6, // 6 hours
  varies: [`Cookie`],
  getKey: getSpecimenRequestCacheId,
}

export default defineCachedEventHandler(async (event) => {
  const { page, pageSize, select, search } = getSpecimenQueryParams(event)
  
  const resources = getAuthorizedResources(event, r => /^specimen(:\w)*$/.test(r))
  const authFields = getAuthorizedFields(event, ...resources)
  const fields = select?.filter(field => !authFields.length || authFields.includes(field))
  if (!resources.length) {
    return create403()
  }

  const query = Specimen.Base.mongoose.model
    .find()
    .where(`authTags`).in(resources)
  
  if (search)  {
    query.where({ $text: { $search: search } })
    query.projection({ score: { $meta: `textScore` } })
    fields.push(`score`)
  }

  // Populate and filter by classification
  if (fields.some(f => f.startsWith(`classification`))) {
    query.populate({ path: `classification`, populate: { path: `ancestors` } })
  }


  // Populate and filter by images
  if (fields.some(f => f.startsWith(`images`))) {
    query.populate(`images`)
  }

  if (fields.some(f => f.startsWith(`collection`))) {
    query.populate(`kollektion`)
  }

  if (fields.some(f => f.startsWith(`age`))) {
    query.populate({ path: `relativeAge`, populate: { path: `ancestors` } })
  }

  if (fields.some(f => f.startsWith(`composition`))) {
    query.populate(`composition`)
  }

  if (fields.some(f => f.startsWith(`collector`))) {
    query.populate(`collector`)
  }
  
  if (fields.some(f => f.startsWith(`sponsor`))) {
    query.populate(`sponsor`)
  }

  if (fields.some(f => f.startsWith(`storage`))) {
    query.populate({ path: `storage.location`, populate: { path: `ancestors` } })
  }

  if (fields.some(f => f.startsWith(`creator`))) {
    query.populate(`creator`)
  }

  if (fields.some(f => f.startsWith(`editor`))) {
    query.populate(`editor`)
  }

  const total = await query.clone().countDocuments()
  const specimens = await query
    .limit(pageSize)
    .skip((page - 1) * pageSize)

  return {
    self: `/api/specimens`,
    entities: specimens.map(specimen => Object.fromEntries(Object
      .entries(specimen.toJSON<ISpecimen>({ transform: renderSpecimen }))
      .filter(([key]) => key === `self` || !fields.length || fields.includes(key as keyof ISpecimen))
    ),),
    ...usePaginator({ total }),
  }
}, cacheOptions)
