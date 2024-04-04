import { type Image } from "@unb-libraries/nuxt-layer-entity"
import ImageFile from "../../documentTypes/Image"

export default defineMongooseFormatter(ImageFile, (doc): Partial<Image> => {
  const { title, alt, type } = doc
  return {
    title,
    alt,
    type: type ? `image` : undefined,
  }
})
