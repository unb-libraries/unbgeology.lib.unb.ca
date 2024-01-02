import { rm as removeFile } from "fs/promises"

export default defineEventHandler(async (event) => {
  const { type } = getRouterParams(event)

  const File = useFileDocumentType(type ?? `file`)
  const files = await File.find()

  await Promise.all(files.map(async (file) => {
    await removeFile(file.filepath, { force: true })
    return file._id
  }))
  await File.deleteMany({ _id: files })

  return sendNoContent(event)
})
