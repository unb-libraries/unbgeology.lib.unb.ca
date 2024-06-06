export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^user(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const body = await readOneDocumentBodyOr400(event, { model: User, flat: true, fields })
  const user = await User.findByID(id)
    .select(`authTags`)
  if (user && !user.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  const update = await user?.update(body)
  return renderDocumentDiffOr404(update, { model: User })
})
