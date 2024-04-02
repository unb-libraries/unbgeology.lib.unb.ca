import { type Image as ImageEntity } from "@unb-libraries/nuxt-layer-entity"
import FileBase from "../../documentTypes/FileBase"
import ImageFile, { type Image as ImageDocument } from "../../documentTypes/Image"

export default defineEntityFormatter<ImageEntity, ImageDocument>(FileBase, (doc) => {
  const { title, alt, type } = doc
  return type === ImageFile.fullName ? { title, alt, type: `image` } : {}
})
