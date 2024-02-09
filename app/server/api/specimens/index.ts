import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { type Specimen } from "types/specimen"

export default defineEventHandler(async (event) => {
  const { page, pageSize, select, filterSelect, search, sort } = getQueryOptions(event)

  const query = Specimen.find()
  if (search) {
    query.search(search)
  }

  await applyFilter(event, {
    category: (op, value) => {
      if (op === FilterOperator.EQ) {
        query.where({ category: Array.isArray(value) ? { $in: value } : value })
      }
    },
  })

  const countQuery = query.clone()
  const total = await countQuery.countDocuments()

  if (page < 1 || page > Math.ceil(total / pageSize)) {
    const error = createError({ statusCode: 400, message: `Invalid page number` })
    return sendError(event, error)
  }

  const specimens = await query
    .select(getSelectedFields(select))
    .populate(`images`, filterSelect({ root: `images`, default: [`_id`, `filename`, `filepath`] }))
    .populate(`classification`, filterSelect({ root: `classification`, default: [`_id`, `label`] }))
    .populate(`age.relative`, filterSelect({ root: `age.relative`, default: [`_id`, `label`, `boundaries`] }))
    .populate(`portion`, filterSelect({ root: `portion`, default: [`_id`, `label`] }))
    .sort(sort.join(` `))
    .paginate(page, pageSize)
    .exec()

  return sendEntityList<Specimen>(event, specimens, { total })
})
