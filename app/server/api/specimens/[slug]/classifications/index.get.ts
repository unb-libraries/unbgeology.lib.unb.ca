import { type Classification } from "types/vocabularies"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  function getSelectedParentFields() {
    const fields = getSelectedFields(select, `parent`)
    return fields.length > 0 ? fields : [`_id`]
  }

  const specimen = await Specimen.findBySlug(slug)
  const classifications = await Classification.find({ _id: specimen.classifications })
    .populate(`parent`, getSelectedParentFields())
    .select(getSelectedFields(select))

  return sendEntityList<Classification>(event, classifications)
})
