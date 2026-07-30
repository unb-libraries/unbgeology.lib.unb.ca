import ImageFile from "../../documentTypes/Image"
import { requireIf, StringValidator as String, validateBody } from "../../utils/api/payload"

export default defineMongooseReader(ImageFile, async (body, options) => {
  const create = options?.op === `create`
  const { mimetype } = await validateBody(body, {
    mimetype: requireIf(create, String),
  })
  if (create && !mimetype!.match(/^image\//)) { return {} }

  const { title, alt } = await validateBody(body, {
    title: optional(String),
    alt: optional(String),
  })

  return {
    type: ImageFile.fullName,
    title,
    alt,
  }
})
