import { removeFile } from "../../utils/api/files/fs"

export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)
  const { sortFields, filter } = getMongooseQuery(event)

  const { documents: files, delete: remove } = await FileBase.find()
    .select(`filepath`)
    .sort(...sortFields)
    .where(...filter)
    .paginate(page, pageSize)

  try {
    await Promise.all(files.map(async (file) => {
      await removeFile(file.filepath)
    }))
    await remove()
  } catch (err: any) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: `Failed to delete files: ${(err as Error).message}`,
    }))
  }

  return sendNoContent(event)
})
