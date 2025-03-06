import { renderSpecimen } from "~/server/documentTypes/Specimen"
import type { Specimen as ISpecimen } from "~/types/specimen"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { select } = getSpecimenQueryParams(event)
  
  const resources = getAuthorizedResources(event, r => /^specimen(:[a-z]+)*$/.test(r))
  const authFields = getAuthorizedFields(event, ...resources)
  
  const fields = select
    ?.filter((field, i, arr) => arr.indexOf(field) === i)
    .filter(field => !authFields.length || authFields.includes(field)) ?? []
  
  if (!resources.length) {
    return create403()
  }

  const query = Specimen.Base.mongoose.model.findOne()
    .where("slug").equals(slug)
    .where("authTags").in(resources)
  
  // Populate and filter by classification
  if (fields.some(f => f.startsWith(`classification`))) {
    query.populate({ path: `classification`, populate: { path: `ancestors`, select: `label` } })
  }

  // Join and filter by images
  if (fields.some(f => f.startsWith(`images`))) {
    query.populate(`images`)
  }

  // Join and filter by collection
  if (fields.some(f => f.startsWith(`collection`))) {
    query.populate(`$kollektion`)
  }

  // Join and filter by age
  if (fields.some(f => f.startsWith(`age`))) {
    query.populate(`relativeAge`)
  }

  // Join and filter by composition
  if (fields.some(f => f.startsWith(`composition`))) {
    query.populate(`composition`)
  }

  // Join and filter by collector
  if (fields.some(f => f.startsWith(`collector`))) {
    query.populate(`collector`)
  }
  
  // Join and filter by sponsor
  if (fields.some(f => f.startsWith(`sponsor`))) {
    query.populate(`sponsor`)
  }

  // Join and filter by storage
  if (fields.some(f => f.startsWith(`storage`))) {
    query.populate({ path: `storage.location`, populate: { path: `ancestors`, select: `label` } })
  }

  // Join and filter by creator
  if (fields.some(f => f.startsWith(`creator`))) {
    query.populate(`creator`)
  }

  // Join and filter by editor
  if (fields.some(f => f.startsWith(`editor`))) {
    query.populate(`editor`)
  }

  const specimen = await query.exec()
  if (specimen) {
    const rendered = renderSpecimen(specimen)
    if (specimen.type === 'Specimen.Mineral' && specimen.classification) {
      const children = await Term.mongoose.model.find().where({ ancestors: specimen?.classification._id })
      rendered.classification.children = children.map(renderClassification)
    }
    return Object.fromEntries(
      Object.entries(rendered).filter(([key]) => key === `self` || !fields.length || fields.includes(key as keyof ISpecimen)))
  }
  return create404()
})
