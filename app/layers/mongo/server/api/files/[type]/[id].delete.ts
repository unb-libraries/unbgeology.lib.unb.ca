import { rm as removeFile } from "fs/promises"

export default defineEventHandler(async (event) => {
  const { type, id } = getRouterParams(event)

  const File = useFileDocumentType(type ?? `file`)
  const file = await File.findOne({ _id: id })
  await removeFile(file.filepath, { force: true })
  await File.deleteOne({ _id: file._id })

  return sendNoContent(event)
})
