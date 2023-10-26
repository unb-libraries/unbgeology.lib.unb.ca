import { type Taxonomy } from "~/layers/mongo/types/taxonomy"

export default defineEventHandler(async (event) => {
  const { type, slug } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  const term = await Taxonomy.findOne({ type, slug })
    .populate(`parent`, getSelectedFields(select, `parent`))
    .select(getSelectedFields(select))

  return sendEntityOr404<Taxonomy>(event, term)
})
