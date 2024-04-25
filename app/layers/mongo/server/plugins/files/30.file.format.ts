import { FileState, type File } from "@unb-libraries/nuxt-layer-entity"

export default defineMongooseFormatter(FileBase, (doc): Partial<File> | void => {
  const { _id, filepath, filename, filesize, mimetype, status, __type, created, updated } = doc
  const { uri } = useRuntimeConfig().uploads as { uri: string }

  return {
    id: `${_id}`,
    filename,
    filesize,
    mimetype,
    type: !__type ? `other` : undefined,
    uri: (filename && useEnum(FileState).valueOf(status) > FileState.PENDING && `${uri}/${filename}`) || filepath || undefined,
    // @ts-ignore
    status: status ? useEnum(FileState).labelOf(status).toLowerCase() as Lowercase<keyof typeof FileState> : undefined,
    created: created ? new Date(created).toISOString() : undefined,
    updated: updated ? new Date(updated).toISOString() : undefined,
  }
})
