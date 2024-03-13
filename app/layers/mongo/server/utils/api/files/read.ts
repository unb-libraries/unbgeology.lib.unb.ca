import { FileState, type File as FileEntity } from "@unb-libraries/nuxt-layer-entity"
import { type File as FileDocument } from "../../../documentTypes/FileBase"

export default defineBodyReader<FileDocument, FileEntity>((body) => {
  const { filename, filepath, filesize, mimetype, uploadName, status, type } = body
  return {
    filename,
    filepath,
    filesize,
    mimetype,
    uploadName,
    type,
    status: status
      ? useEnum(FileState).valueOf(status)
      : undefined,
  }
})
