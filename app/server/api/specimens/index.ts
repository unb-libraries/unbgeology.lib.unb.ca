import { type Specimen } from "types/specimen"

export default defineEventHandler(async (event) => {
  const { page, pageSize, select, filterSelect, sort } = getQueryOptions(event)

  const specimens = await Specimen.find()
    .select(getSelectedFields(select))
    .populate(`images`, filterSelect({ root: `images`, default: [`_id`, `filename`, `filepath`] }))
    .populate(`classification`, filterSelect({ root: `classification`, default: [`_id`, `label`] }))
    .populate(`age.relative`, filterSelect({ root: `age.relative`, default: [`_id`, `label`, `boundaries`] }))
    .populate(`portion`, filterSelect({ root: `portion`, default: [`_id`, `label`] }))
    .sort(sort.join(` `))
    .paginate(page, pageSize)

  return sendEntityList<Specimen>(event, specimens, { total: await Specimen.countDocuments() })
})
