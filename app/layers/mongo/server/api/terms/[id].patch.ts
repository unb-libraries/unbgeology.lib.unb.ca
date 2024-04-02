import { type Term } from "../../documentTypes/Term"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readOneBodyOr400<Term>(event)
  const update = await Term.updateByID(id, body)

  return renderDiffOr404(event, update)
})
