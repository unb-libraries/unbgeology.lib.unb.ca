import { type Classification } from "~/server/taxonomies/Classification"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { select } = getQueryOptions(event)
  
  function getSelectedParentFields() {
    const fields = getSelectedFields(select, `parent`)
    return fields.length > 0 ? fields : [`_id`]
  }
  
  const specimen = await Specimen.findByPK(slug)
  const classifications = await Classification.find({ _id: specimen.classifications })
    .populate(`parent`, getSelectedParentFields())
    .select(getSelectedFields(select))
  
  return sendEntityList<Classification>(event, classifications)
})
