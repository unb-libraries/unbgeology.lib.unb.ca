import DocumentFile from "../../documentTypes/Document"
import type { Document } from "@unb-libraries/nuxt-layer-entity"

export default defineMongooseFormatter(DocumentFile, (doc): Partial<Document> | void => {
  if (!(doc.__type && doc.__type.startsWith(DocumentFile.fullName))) { return }

  const { type } = doc
  return {
    type: type ? `document` : undefined,
  }
})
