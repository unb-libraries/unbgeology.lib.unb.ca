import { type Specimen } from "~/types/entity"

export default defineEventHandler(async (event) => {
  const { page, pageSize, select, sort } = getQueryOptions(event)

  function getSelectedClassificationFields() {
    const fields = getSelectedFields(select, `classifications`)
    return fields.length > 0 ? fields : [`_id`]
  }

  const specimens = await Specimen.find()
    .populate(`classifications`, getSelectedClassificationFields())
    .select(getSelectedFields(select))
    .sort(sort.join(` `))
    .paginate(page, pageSize)

  return sendEntityList<Specimen>(event, specimens, { total: await Specimen.countDocuments() })
})
