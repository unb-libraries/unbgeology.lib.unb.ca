export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const resources = getAuthorizedResources(event, r => /^file(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)

  const query = FileBase.find()
    .where(`authTags`).in(resources)
  await useEventQuery(event, query)
  const { documents: files, total } = await query
    .paginate(page, pageSize)

  return renderDocumentList(files, { total, model: FileBase, canonical: { fields } })
})
