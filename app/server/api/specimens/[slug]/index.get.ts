import { type Specimen } from "~/types/entity"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  function getSelectedClassificationFields() {
    const fields = getSelectedFields(select, `classifications`)
    return fields.length > 0 ? fields : [`_id`]
  }

  const specimen = await Specimen.findByPK(slug)
    .populate(`classifications`, getSelectedClassificationFields())
    .select(getSelectedFields(select))

  return sendEntityOr404<Specimen>(event, specimen)
})
