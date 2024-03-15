import { formatTerm } from "../../utils/api/terms"

export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const { fields, sortFields, filter } = getMongooseQuery(event)
  const { documents: terms, total } = await Term.find()
    .and(...filter)
    .select(...fields)
    .sort(...sortFields)
    .paginate(page, pageSize)

  return createContentOr404(formatTerm.many(terms, { total }))
})
