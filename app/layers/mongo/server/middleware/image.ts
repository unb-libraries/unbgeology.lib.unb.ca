import { type Image as ImageEntity } from "@unb-libraries/nuxt-layer-entity"
import FileFormatter from "../utils/api/files/format"
import FileReader from "../utils/api/files/read"
import ImageFile, { type Image as ImageDocument } from "../documentTypes/Image"

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (pathname.startsWith(`/api/files`)) {
    await import(`../documentTypes/Image`)

    FileReader.merge<ImageDocument, ImageEntity>((body) => {
      const { mimetype, title, alt } = body
      return {
        type: mimetype?.split(`/`)[0] === `image`
          ? ImageFile.mongoose.model.modelName
          : undefined,
        title,
        alt,
      }
    })

    FileFormatter.merge<ImageDocument, ImageEntity>((doc) => {
      const { title, alt, type } = doc
      return {
        title,
        type: type ? `image` : undefined,
        alt,
      }
    })

    const { select } = getQueryOptions(event)
    const defaultFields = [
      `title`,
      `alt`,
    ]

    addMongooseField(event, ...(select.length > 0
      ? select.filter(field => defaultFields.includes(field))
      : defaultFields))
  }
})
