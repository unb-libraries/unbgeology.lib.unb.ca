import { removeFile } from "../../utils/api/files/fs"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const file = await FileBase.findByID(id)
  if (!file) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: `File not found`,
    }))
  }

  try {
    await removeFile(file.filepath)
    await file.delete()
  } catch (err: any) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: `Failed to delete file: ${(err as Error).message}`,
    }))
  }

  return sendNoContent(event)
})
