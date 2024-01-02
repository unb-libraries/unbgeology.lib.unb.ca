export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  await Migration.findByPKAndDelete(id)
  return sendNoContent(event)
})
