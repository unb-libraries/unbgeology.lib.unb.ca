export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const handlers = getMongooseMiddleware(event)

  await Term.delete()
    .use(...handlers)
    .paginate(page, pageSize)

  return sendNoContent(event)
})
