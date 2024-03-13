import { FileState } from "@unb-libraries/nuxt-layer-entity"
import formatFile from "../../utils/api/files/format"
import { getUploadDir, moveFile } from "../../utils/api/files/fs"
import readFileBody from "../../utils/api/files/read"
import type { File } from "../../documentTypes/FileBase"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const file = await FileBase.findByID(id)
    .select(`filename`, `filepath`, `status`)

  if (!file) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: `File not found`,
    }))
  }

  const update: Partial<File> = {}
  const { filename: newFilename, status: newStatus } = await readFileBody.one(event)

  if (newFilename) {
    update.filename = newFilename
    update.filepath = [
      file.filepath.slice(0, file.filepath.lastIndexOf(`/`)),
      newFilename].join(`/`)
  }

  const Status = useEnum(FileState)
  if (newStatus && Status.valueOf(newStatus) > Status.valueOf(file.status)) {
    update.status = newStatus
    update.filepath = `${getUploadDir(Status.valueOf(newStatus))}/${newFilename ?? file.filename}`
  }

  if (update.filepath) {
    try {
      await moveFile(file.filepath, update.filepath)
    } catch (err: any) {
      throw new Error(`Failed to rename file: ${(err as Error).message}`)
    }
  }

  const [before, after] = await file.update(update)
  return createContentOr404(formatFile.diff(before, after))
})
