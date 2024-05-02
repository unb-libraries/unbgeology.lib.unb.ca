import { FileState } from "@unb-libraries/nuxt-layer-entity"
import { fileExists, getUploadDir, moveFile } from "../../utils/api/files/fs"
import { type File } from "../../documentTypes/FileBase"

export default defineEventHandler(async (event) => {
  const resources = getAuthorizedResources(event, r => /^file(:\w)*$/.test(r))
  if (!resources.length) {
    return create403()
  }

  const createExisting = async (bodies: File[]) => {
    const docs = await FileBase.create(
      bodies.filter(async ({ filepath }) => filepath && await fileExists(filepath)))
    return Array.isArray(docs) ? docs : [docs]
  }

  const body = await readDocumentBodyOr400(event, { model: FileBase })
  const docs = await createExisting((Array.isArray(body) ? body : [body]))

  await Promise.all(docs.map(async (doc): Promise<void> => {
    const { _id, uploadName } = doc
    const uploadDir = getUploadDir(useEnum(FileState).valueOf(doc.status))
    const filename = `${_id}-${uploadName}`
    const filepath = `${uploadDir}/${filename}`
    await moveFile(doc.filepath, filepath)
    await FileBase.updateByID(`${doc._id}`, { filepath, filename })
  }))

  return docs.length > 1
    ? renderDocumentList(docs, { model: FileBase })
    : renderDocument(docs[0], { model: FileBase })
})
