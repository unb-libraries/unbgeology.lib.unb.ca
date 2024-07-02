import { removeFile } from "../../utils/api/files/fs"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const resources = getAuthorizedResources(event, r => /^file(:\w+)*$/.test(r))

  try {
    const file = await FileBase.findByID(id)
    if (file && !file.authTags.some(t => resources.includes(t))) {
      return create403()
    }

    if (file) {
      await removeFile(file.filepath)
      await FileBase.deleteByID(id)
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
