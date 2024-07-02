import { FileState } from "@unb-libraries/nuxt-layer-entity"
import { getUploadDir, moveFile } from "../../utils/api/files/fs"
import type { File } from "../../documentTypes/FileBase"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^file(:\w+)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)

  const file = await FileBase.findByID(id)
    .select(`filename`, `filepath`, `status`, `authTags`)

  if (file && !file.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  if (!file) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: `File not found`,
    }))
  }

  const update: Partial<File> = {}
  const { filename: newFilename, status: newStatus } = await readOneDocumentBodyOr400<File>(event, { model: FileBase })

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

  return renderDocumentDiffOr404(await file.update(update), { model: FileBase, fields })
})
