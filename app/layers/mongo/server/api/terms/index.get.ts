export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const handlers = getMongooseMiddleware(event)
  const { documents: terms, total } = await Term.find()
    .use(...handlers)
    .paginate(page, pageSize)

  return renderList(event, terms, { total })
})
