import { FileState, type File as FileEntity } from "@unb-libraries/nuxt-layer-entity"
import { type File as FileDocument } from "../../../documentTypes/FileBase"

export default defineEntityFormatter<FileEntity, Partial<FileDocument>>((item) => {
  const { _id, filename, filesize, mimetype, status, type, created, updated } = item

  return {
    id: `${_id}`,
    filename,
    filesize,
    mimetype,
    type,
    uri: (() => {
      const { uri } = useRuntimeConfig().uploads as { uri: string }
      return filename && status && useEnum(FileState).valueOf(status) > FileState.PENDING
        ? `${uri}/${filename}`
        : undefined
    })(),
    // @ts-ignore
    status: status ? useEnum(FileState).labelOf(status).toLowerCase() as Lowercase<keyof typeof FileState> : undefined,
    created: created ? new Date(created).toISOString() : undefined,
    updated: updated ? new Date(updated).toISOString() : undefined,
  }
})
