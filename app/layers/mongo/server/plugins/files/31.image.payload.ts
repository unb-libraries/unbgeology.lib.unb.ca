import ImageFile from "../../documentTypes/Image"
import { requireIf, StringValidator as String, validateBody } from "../../utils/api/payload"

const pluginOptions = {
  enable: (body: any) => {
    return body.mimetype?.match(/\/image$/)
  },
}

export default defineMongooseReader(ImageFile, async (body, options) => {
  const create = options?.op === `create`
  const { title, alt } = await validateBody(body, {
    mimetype: requireIf(create, String),
    title: optional(String),
    alt: optional(String),
  })

  return {
    type: ImageFile.fullName,
    title,
    alt,
  }
}, pluginOptions)
