import { Read } from "../../../types"
import { readTerm } from "../../utils/api/terms"

export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const { sortFields, filter } = getMongooseQuery(event)

  const body = await readTerm.one<Read.UPDATE>(event)
  const { update: updateTerms } = await Term.find()
    .where(...filter)
    .sort(...sortFields)
    .paginate(page, pageSize)
  const diffs = await updateTerms(body)

  return renderDiffList(event, diffs)
})
