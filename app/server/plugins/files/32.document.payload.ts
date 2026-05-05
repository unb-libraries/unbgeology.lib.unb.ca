import DocumentFile from "../../documentTypes/Document"
import { requireIf, StringValidator as String, validateBody } from "../../utils/api/payload"

export default defineMongooseReader(DocumentFile, async (body, options) => {
  const create = options?.op === `create`
  const { mimetype } = await validateBody(body, {
    mimetype: requireIf(create, String),
  })

  if (create && ![`application/pdf`].includes(mimetype!)) {
    return {}
  }

  return {
    type: DocumentFile.fullName,
  }
})
