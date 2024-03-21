import { readTerm } from "../../utils/api/terms"

export default defineEventHandler(async (event) => {
  const body = await readTerm(event)
  const terms = await Term.create(body)

  return renderOr404(event, terms)
})
