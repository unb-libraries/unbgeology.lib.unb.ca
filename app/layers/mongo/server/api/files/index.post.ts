import { FileState } from "@unb-libraries/nuxt-layer-entity"
import { fileExists, getUploadDir, moveFile } from "../../utils/api/files/fs"
import readFileBody from "../../utils/api/files/read"
import { type File } from "../../documentTypes/FileBase"

export default defineEventHandler(async (event) => {
  const createExisting = async (bodies: File[]) => {
    const docs = await FileBase.create(
      bodies.filter(async ({ filepath }) => filepath && await fileExists(filepath)))
    return Array.isArray(docs) ? docs : [docs]
  }

  const body = await readFileBody(event)
  const docs = await createExisting((Array.isArray(body) ? body : [body]))

  await Promise.all(docs.map(async (doc): Promise<void> => {
    const { _id, uploadName } = doc
    const uploadDir = getUploadDir(useEnum(FileState).valueOf(doc.status))
    const filename = `${_id}-${uploadName}`
    const filepath = `${uploadDir}/${filename}`
    await moveFile(doc.filepath, filepath)
    doc.filepath = filepath
    doc.filename = filename
    doc.save()
  }))

  return renderList(event, docs.map(({ _id }) => ({ _id })))
})
