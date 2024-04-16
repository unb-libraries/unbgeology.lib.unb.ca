import { removeFile } from "../../utils/api/files/fs"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  try {
    const file = await FileBase.findByID(id)
    if (file) {
      await removeFile(file.filepath)
      await FileBase.delete()
      return sendNoContent(event)
    } else {
      return create404()
    }
  } catch (err: any) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: `Failed to delete file: ${(err as Error).message}`,
    }))
  }
})
