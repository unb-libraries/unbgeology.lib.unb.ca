export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const handlers = getMongooseMiddleware(event)
  const term = await Term.findByID(id)
    .use(...handlers)

  return renderOr404(event, term)
})
