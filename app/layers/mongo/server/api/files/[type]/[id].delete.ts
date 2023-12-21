export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  await ImageFile.deleteOne({ _id: id })
  return sendNoContent(event)
})
