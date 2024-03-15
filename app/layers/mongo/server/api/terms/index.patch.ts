import { Read } from "../../../types"
import { formatTerm, readTerm } from "../../utils/api/terms"

export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const { sortFields, filter } = getMongooseQuery(event)

  const body = await readTerm.one<Read.UPDATE>(event)
  const { update: updateTerms } = await Term.find()
    .where(...filter)
    .sort(...sortFields)
    .paginate(page, pageSize)

  const update = (await updateTerms(body))
  return createContentOr404(formatTerm.diff(update))
})
