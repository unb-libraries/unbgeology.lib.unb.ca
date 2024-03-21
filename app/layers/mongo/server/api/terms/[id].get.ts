export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { fields } = getMongooseQuery(event)
  const term = await Term.findByID(id)
    .select(...fields)

  return renderOr404(event, term)
})
