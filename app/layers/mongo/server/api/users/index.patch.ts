export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const resources = getAuthorizedResources(event, r => /^user(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const body = await readOneDocumentBodyOr400(event, { model: User, flat: true, fields })
  const query = User.update(body)
    .where(`authTags`).in(resources)
  await useEventQuery(event, query)

  const { documents: updates, total } = await query
    .paginate(page, pageSize)

  return renderDocumentDiffList(updates, {
    model: User,
    total,
    canonical: {
    // @ts-ignore
      self: (user: { _username: string }) => `/api/users/${user.username}`,
      fields,
    },
  })
})
