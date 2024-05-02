export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^user(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)

  const query = User.findOne()
    .where(`username`).eq(username)
  await useEventQuery(event, query)

  const user = await query
  if (user && !user.authTags.some(t => resources.includes(t))) {
    return create403()
  }
  return renderDocumentOr404(user, { model: User, fields })
})
