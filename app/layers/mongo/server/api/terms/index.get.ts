export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const { fields, sortFields, filter } = getMongooseQuery(event)
  const { documents: terms, total } = await Term.find()
    .where(...filter)
    .select(...fields)
    .sort(...sortFields)
    .paginate(page, pageSize)

  return renderList(event, terms, { total })
})
