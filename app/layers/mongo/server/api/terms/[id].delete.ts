export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  await Term.deleteByID(id)
  return sendNoContent(event)
})
