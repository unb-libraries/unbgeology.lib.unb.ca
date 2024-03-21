import { type Image as ImageEntity } from "@unb-libraries/nuxt-layer-entity"
import FileModel from "../documentTypes/FileBase"
import { type Image as ImageDocument } from "../documentTypes/Image"

export default defineEntityFormatter<ImageEntity, ImageDocument>(FileModel, (doc) => {
  const { title, alt, type } = doc
  return {
    title,
    type: type ? `image` : undefined,
    alt,
  }
})
