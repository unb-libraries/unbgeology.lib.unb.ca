import { type Term } from "../../documentTypes/Term"

export default defineEventHandler(async (event) => {
  const body = await readBodyOr400<Term>(event)
  const terms = await Term.create(body)

  return renderOr404(event, terms)
})
