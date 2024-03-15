import { Read } from "../../../types"
import { formatTerm, readTerm } from "../../utils/api/terms"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readTerm.one<Read.UPDATE>(event)
  const term = await Term.findByID(id)
  const [before, after] = await term.update(body)

  return createContentOr404(formatTerm.diff(before, after))
})
