import { type Entity, type Document as DocumentEntity, FileState } from "@unb-libraries/nuxt-layer-entity"
import FileBase, { type File, Mimetyped, renderFile } from "./FileBase"

export interface Document extends Omit<DocumentEntity, keyof Entity>, File {
}

export function renderDocumentFile(doc: Document) {
  return {
    ...renderFile(doc),
    type: `document`,
  }
}

export default defineDocumentModel<File, Document>(`Document`, defineDocumentSchema<Document>({
}).mixin(Mimetyped({
  accept: [
    `application/pdf`,
  ],
})).mixin(Authorize<File>({
  paths: (file) => {
    const status = useEnum(FileState).labelOf(file.status).toLowerCase()
    return [
      `file`,
      `file:${status}`,
      `file:document`,
      `file:document:${status}`,
    ]
  },
}))(), FileBase)
