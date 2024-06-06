export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^user(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)

  const query = User.findByID(id)
    .select(`authTags`)
  await useEventQuery(event, query)

  const user = await query
  if (user && !user.authTags.some(t => resources.includes(t))) {
    return create403()
  }
  return renderDocumentOr404(user, { model: User, fields })
})
