export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const query = User.find()
  await useEventQuery(event, query)
  const { documents: users, total } = await query
    .select([`_username`, `$username`])
    .paginate(page, pageSize)

  return renderDocumentList(users, {
    model: User,
    total,
    canonical: {
      // @ts-ignore
      self: user => `/api/users/${user._username}`,
    },
  })
})
