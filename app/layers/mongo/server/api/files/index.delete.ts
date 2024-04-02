import { removeFile } from "../../utils/api/files/fs"

export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const handlers = getMongooseMiddleware(event)

  const { documents: files } = await FileBase.find()
    .select(`filepath`)
    .use(...handlers)
    .paginate(page, pageSize)

  try {
    await Promise.all(files.map(async (file) => {
      await removeFile(file.filepath)
      await file.delete()
    }))
  } catch (err: any) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: `Failed to delete files: ${(err as Error).message}`,
    }))
  }

  return sendNoContent(event)
})
