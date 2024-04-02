export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const handlers = getMongooseMiddleware(event)
  const file = await FileBase.findByID(id)
    .use(...handlers)

  return renderOr404(event, file)
})
