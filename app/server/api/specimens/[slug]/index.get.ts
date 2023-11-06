import { type Specimen } from "types/specimen"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  function getSelectedClassificationFields() {
    const fields = getSelectedFields(select, `classifications`)
    return fields.length > 0 ? fields : [`_id`]
  }

  function getSelectedImageFields() {
    const fields = getSelectedFields(select, `images`)
    return fields.length > 0 ? fields : [`_id`]
  }

  const specimen = await Specimen.findByPK(slug)
    .populate(`classifications`, getSelectedClassificationFields())
    .populate(`images`, getSelectedImageFields())
    .select(getSelectedFields(select))

  return sendEntityOr404<Specimen>(event, specimen)
})
