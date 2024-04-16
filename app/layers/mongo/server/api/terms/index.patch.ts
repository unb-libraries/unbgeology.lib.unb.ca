import { type Term } from "../../documentTypes/Term"

export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const body = await readOneBodyOr400<Term>(event)
  const query = Term.update(body)
  await useEventQuery(event, query)

  const { documents: updates, total } = await query
    .paginate(page, pageSize)

  return renderDiffList(updates, { total })
})
