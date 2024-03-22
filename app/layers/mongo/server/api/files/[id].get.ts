export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { fields } = getMongooseQuery(event)

  const file = await FileBase.findByID(id)
    .select(fields)

  return renderOr404(event, file)
})
