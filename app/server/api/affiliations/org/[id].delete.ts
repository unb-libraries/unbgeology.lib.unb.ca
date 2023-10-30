export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  await Organization.deleteOne({ _id: id })
  return sendNoContent(event)
})
