export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { delete: deleteTerm } = await Term.findByID(id)
  await deleteTerm()
  return sendNoContent(event)
})
