export default defineMongooseHandler(FileBase, async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const handlers = getMongooseMiddleware(event)

  const { documents: files, total } = await FileBase.find()
    .use(...handlers)
    .paginate(page, pageSize)

  return renderList(event, files, { total })
})
