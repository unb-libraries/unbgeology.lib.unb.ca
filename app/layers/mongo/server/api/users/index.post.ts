export default defineEventHandler(async (event) => {
  const resources = getAuthorizedResources(event, r => /^user(:\w)*$/.test(r))
  if (!resources.length) {
    return create403()
  }

  const body = await readDocumentBodyOr400(event, { model: User })
  const userOrUsers = await User.create(body)

  const self = (user: { username: string }) => `/api/users/${user.username}`
  return Array.isArray(userOrUsers)
    ? renderDocumentList(userOrUsers, {
      model: User,
      pageSize: userOrUsers.length,
      canonical: {
        self,
      },
    })
    : renderDocument(userOrUsers, { model: User, self })
})
