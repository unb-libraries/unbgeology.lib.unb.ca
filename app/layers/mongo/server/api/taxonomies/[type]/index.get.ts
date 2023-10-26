import { type Taxonomy } from "~/layers/mongo/types/taxonomy"

export default defineEventHandler(async (event) => {
  const { type } = getRouterParams(event)
  const { page, pageSize, select, sort } = getQueryOptions(event)

  const terms = await Taxonomy.find({ type })
    .populate(`parent`, getSelectedFields(select, `parent`))
    .select(getSelectedFields(select))
    .sort(sort.join(` `))
    .paginate(page, pageSize)

  return sendEntityList<Taxonomy>(event, terms, { total: await Taxonomy.countDocuments({ type }) })
})
