import { Read } from "../../../types"
import { readTerm } from "../../utils/api/terms"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readTerm.one<Read.UPDATE>(event)
  const update = await Term.update(id, body)

  return renderDiffOr404(event, update)
})
