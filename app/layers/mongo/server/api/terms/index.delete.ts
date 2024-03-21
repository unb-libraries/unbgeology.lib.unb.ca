export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const { sortFields, filter } = getMongooseQuery(event)
  const { delete: deleteTerms } = await Term.find()
    .and(...filter)
    .select(`_id type`)
    .sort(...sortFields)
    .paginate(page, pageSize)

  await deleteTerms()
  return sendNoContent(event)
})
