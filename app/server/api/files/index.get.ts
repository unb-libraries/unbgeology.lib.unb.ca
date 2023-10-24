import { File as FileEntity, type File } from "~/server/entityTypes/File"

export default defineEventHandler(async (event) => {
  const files = await FileEntity.find()
  return sendEntityList<File>(event, files)
})
