export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const body = await readOneDocumentBodyOr400(event, { model: User, flat: true })
  const query = User.update(body)
  await useEventQuery(event, query)
  const { documents: updates, total } = await query
    .paginate(page, pageSize)

  return renderDocumentDiffList(updates, {
    model: User,
    total,
    canonical: {
    // @ts-ignore
      self: (user: { _username: string }) => `/api/users/${user.username}`,
    },
  })
})
