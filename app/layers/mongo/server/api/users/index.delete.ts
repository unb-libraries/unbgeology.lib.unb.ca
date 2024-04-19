export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const query = User.delete()
  await useEventQuery(event, query)
  await query.paginate(page, pageSize)

  return sendNoContent(event)
})
