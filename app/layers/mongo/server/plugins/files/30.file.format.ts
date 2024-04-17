import { FileState, type File } from "@unb-libraries/nuxt-layer-entity"

export default defineMongooseFormatter(FileBase, (doc): Partial<File> | void => {
  if (!(doc.__type && doc.__type.startsWith(FileBase.fullName))) { return }

  const { _id, filename, filesize, mimetype, status, type, created, updated } = doc
  return {
    id: `${_id}`,
    filename,
    filesize,
    mimetype,
    type: type ? `other` : undefined,
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
