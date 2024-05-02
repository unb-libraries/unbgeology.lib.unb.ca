export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const resources = getAuthorizedResources(event, r => /^user(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const query = User.find()
    .where(`authTags`).in(resources)
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
      fields,
    },
  })
})
