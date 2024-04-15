export default defineMongooseEventQueryHandler(FileBase, (event, query) => {
  const { select, sort } = getQueryOptions(event)
  const defaultFields = [
    `title`,
    `alt`,
  ]

  query.select(`_id`, ...(select.length > 0
    ? select.filter(field => defaultFields.includes(field))
    : defaultFields))

  if (`sort` in query) {
    query.sort(...sort.filter(([field]) => defaultFields.includes(field)))
  }
})
