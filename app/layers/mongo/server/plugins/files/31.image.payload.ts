import { requireIf, StringValidator as String, validateBody } from "../../utils/api/payload"
import { type Payload } from "../../../types/entity"
import ImageFile, { type Image } from "../../documentTypes/Image"

export default defineBodyReader<Payload<Image>>(FileBase, async (body, options) => {
  const create = options?.op === `create`
  const { mimetype, title, alt } = await validateBody(body, {
    mimetype: requireIf(create, String),
    title: optional(String),
    alt: optional(String),
  })

  const type = mimetype?.split(`/`)[0]
  return type === `image`
    ? {
        type: ImageFile.fullName,
        title,
        alt,
      }
    : {}
})
