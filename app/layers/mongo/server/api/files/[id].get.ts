export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^file(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)

  const query = FileBase.findByID(id).select(`authTags`)
  await useEventQuery(event, query)

  const file = await query
  if (file && !file.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  return renderDocumentOr404(file, { model: FileBase, fields })
})
