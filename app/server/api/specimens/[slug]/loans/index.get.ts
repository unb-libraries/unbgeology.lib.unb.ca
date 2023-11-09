import { type Loan } from "types/specimen"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { select, filterSelect } = getQueryOptions(event)

  const query = Specimen.findByPK(slug)
  const fields = filterSelect({ prefix: `loans`, default: select.length ? [`_id`] : [] })
  if (fields.length > 0) {
    query.select(fields)
  }

  const specimen = await query.exec()
  return sendEntityList<Loan>(event, specimen.loans)
})
