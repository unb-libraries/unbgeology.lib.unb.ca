export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  await Term.delete(id)
  return sendNoContent(event)
})
