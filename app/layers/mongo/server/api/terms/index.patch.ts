import { type Term } from "../../documentTypes/Term"

export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const handlers = getMongooseMiddleware(event)

  const body = await readOneBodyOr400<Term>(event)
  const { documents: updates, total } = await Term.update(body)
    .use(...handlers)
    .paginate(page, pageSize)

  return renderDiffList(event, updates, { total })
})
