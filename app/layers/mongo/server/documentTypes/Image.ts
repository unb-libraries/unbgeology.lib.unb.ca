import { type Entity, type Image as ImageEntity, FileState } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes } from "../../types/entity"
import FileBase, { type File, Mimetyped } from "./FileBase"

export interface Image extends Omit<ImageEntity, keyof Entity>, File {}

export default defineDocumentModel<File, Image>(`Image`, defineDocumentSchema<Image>({
  alt: {
    type: EntityFieldTypes.String,
    required: false,
  },
  title: {
    type: EntityFieldTypes.String,
    required: false,
  },
}).mixin(Mimetyped({
  accept: [
    `image/jpeg`,
  ],
})).mixin(Authorize<File>({
  paths: (file) => {
    const status = useEnum(FileState).labelOf(file.status).toLowerCase()
    return [
      `file`,
      `file:${status}`,
      `file:image`,
      `file:image:${status}`,
    ]
  },
}))(), FileBase)
