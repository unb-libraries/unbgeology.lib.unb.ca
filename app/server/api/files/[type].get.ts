import { File as FileEntity, type File } from "~/server/entityTypes/File"

export default defineEventHandler(async (event) => {
  const { type } = getRouterParams(event)
  const files = await FileEntity.find({ type })
  return sendEntityList<File>(event, files)
})
