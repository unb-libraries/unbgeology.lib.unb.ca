import { type Term } from "../../documentTypes/Term"

export default defineEventHandler(async (event) => {
  const body = await readBodyOr400<Term>(event)
  const termOrTerms = await Term.create(body)

  return Array.isArray(termOrTerms)
    ? renderList(termOrTerms.map(({ _id }) => _id))
    : renderDocument(termOrTerms, { model: Term })
})
