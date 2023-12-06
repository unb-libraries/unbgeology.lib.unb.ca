import { type Term } from "layers/base/types/entity"

export default defineEventHandler(async (event) => {
  const { type } = getRouterParams(event)
  const { page, pageSize, select, sort } = getQueryOptions(event)

  const terms = await TermBase.find({ type })
    .populate(`parent`, getSelectedFields(select, `parent`))
    .select(getSelectedFields(select))
    .sort(sort.join(` `))
    .paginate(page, pageSize)

  return sendEntityList<Term>(event, terms, { total: await TermBase.countDocuments({ type }) })
})
