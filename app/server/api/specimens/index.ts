import { type Specimen } from "types/specimen"

export default defineEventHandler(async (event) => {
  const { page, pageSize, select, filterSelect, sort } = getQueryOptions(event)

  const specimens = await Specimen.find()
    .select(getSelectedFields(select))
    .populate(`images`, filterSelect({ root: `images`, default: [`_id`, `filename`, `filepath`] }))
    .populate(`classifications`, filterSelect({ root: `classifications`, default: [`_id`, `label`] }))
    .populate(`age.relative`, filterSelect({ root: `age.relative`, default: [`_id`, `label`, `boundaries`] }))
    .sort(sort.join(` `))
    .paginate(page, pageSize)

  return sendEntityList<Specimen>(event, specimens, { total: await Specimen.countDocuments() })
})
