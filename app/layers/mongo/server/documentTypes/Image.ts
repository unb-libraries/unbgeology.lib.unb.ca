import { EntityFieldTypes } from '../../types/entity'
import { type Entity, type Image as ImageEntity, FileState } from "@unb-libraries/nuxt-layer-entity"
import FileBase, { type File, Mimetyped, renderFile } from "./FileBase"

export interface Image extends Omit<ImageEntity, keyof Entity>, File {}

export function renderImageFile(image: Image) {
  return {
    ...renderFile(image),
    alt: image.alt,
    title: image.title,
    type: `image`,
  }
}

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
    `image/png`,
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
