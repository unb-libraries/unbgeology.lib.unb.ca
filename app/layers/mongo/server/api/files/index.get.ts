export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const query = FileBase.find()
  await useEventQuery(event, query)
  const { documents: files, total } = await query
    .paginate(page, pageSize)

  return renderList(event, files, { total })
})
