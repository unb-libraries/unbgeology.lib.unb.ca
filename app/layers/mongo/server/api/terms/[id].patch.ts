import { Read } from "../../../types"
import { readTerm } from "../../utils/api/terms"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readTerm.one<Read.UPDATE>(event)
  const term = await Term.findByID(id)
  const diff = await term.update(body)

  return renderDiffOr404(event, diff)
})
