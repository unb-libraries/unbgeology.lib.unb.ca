export default defineEventHandler(async (event) => {
  const resources = getAuthorizedResources(event, r => /^user(:\w)*$/.test(r))
  if (!resources.length) {
    return create403()
  }

  const body = await readDocumentBodyOr400(event, { model: User })
  const userOrUsers = await User.create(body)

  return Array.isArray(userOrUsers)
    ? renderDocumentList(userOrUsers, {
      model: User,
      pageSize: userOrUsers.length,
      canonical: {
        self: user => `/api/users/${user._id}`,
      },
    })
    : renderDocument(userOrUsers, { model: User, self: user => `/api/users/${user._id}` })
})
