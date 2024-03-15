import { formatTerm } from "../../utils/api/terms"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { fields } = getMongooseQuery(event)
  const term = await Term.findByID(id)
    .select(...fields)

  return createContentOr404(formatTerm.one(term))
})
