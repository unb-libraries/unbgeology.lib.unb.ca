export default defineEventHandler(async (event) => {
  const { type, id } = getRouterParams(event)

  const File = useFileDocumentType(type ?? `file`)
  const file = await File.findOneAndDelete({ _id: id })
  return sendNoContent(event)
})
