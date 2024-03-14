import { type Entity, type Document as DocumentEntity } from "@unb-libraries/nuxt-layer-entity"
import FileBase, { type File, Mimetyped } from "./FileBase"

export interface Document extends Omit<DocumentEntity, keyof Entity>, File {
}

export default defineDocumentModel<File, Document>(`Document`, defineDocumentSchema<Document>({
}).mixin(Mimetyped({
  accept: [
    `application/pdf`,
  ],
}))(), FileBase)
