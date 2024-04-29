export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const query = User.delete()
  await useEventQuery(event, query)
  const { documents: deletedUsers } = await query.paginate(page, pageSize)
  await Promise.all(deletedUsers.map(({ username }) => removeUser(username)))

  return sendNoContent(event)
})
