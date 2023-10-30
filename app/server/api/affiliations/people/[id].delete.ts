export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  await Person.deleteOne({ _id: id })
  return sendNoContent(event)
})