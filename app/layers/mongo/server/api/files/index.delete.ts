import { rm as removeFile } from "fs/promises"

export default defineEventHandler(async (event) => {
  const files = await FileBase.find()

  await Promise.all(files.map(async (file) => {
    await removeFile(file.filepath, { force: true })
    return file._id
  }))
  await FileBase.deleteMany({ _id: files })

  return sendNoContent(event)
})
