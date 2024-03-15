import { formatTerm, readTerm } from "../../utils/api/terms"

export default defineEventHandler(async (event) => {
  const body = await readTerm(event)
  const terms = await Term.create(body)

  return createContentOr404(formatTerm(terms))
})
