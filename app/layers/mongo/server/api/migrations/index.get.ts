export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const resources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const query = Migration.find()
    .where(`authTags`).in(resources)
  await useEventQuery(event, query)
  const { documents: migrations, total } = await query
    .paginate(page, pageSize)

  return renderDocumentList(migrations, { model: Migration, total, canonical: { fields } })
})
