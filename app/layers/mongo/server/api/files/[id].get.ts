export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const query = FileBase.findByID(id)
  await useEventQuery(event, query)
  const file = await query

  return renderOr404(event, file)
})
