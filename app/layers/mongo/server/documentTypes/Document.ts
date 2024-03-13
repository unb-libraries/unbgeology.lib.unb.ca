import { type Entity, type Document as DocumentEntity } from "@unb-libraries/nuxt-layer-entity"
import FileBase, { type File, Mimetyped } from "./FileBase"

export interface Document extends Omit<DocumentEntity, keyof Entity>, File {
}

const Schema = defineDocumentSchema
  .mixin(Mimetyped({ accept: [`application/pdf`] }))

export default defineDocumentModel<File, Document>(`Document`, Schema<Document>({
})(), FileBase)
