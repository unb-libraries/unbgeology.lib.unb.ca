import { Status } from "~/types/classification"

export default defineMongooseReader(Classification.Rock, async (payload, options) => {
  if (options.op === `create` && payload.type !== `classification/rock`) { return {} }

  const { description, image, parent, status } = await validateBody(payload, {
    description: optional(StringValidator),
    image: optional(MatchValidator(/^\/api\/files\/[a-z0-9]{24}$/)),
    // FIX: Work around as URIEntityTypeValidator cannot authorize against the API
    parent: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    status: optional(EnumValidator(Status)),
  })

  return {
    description,
    image: image && { _id: image.substring(1).split(`/`).at(-1)! },
    parent: parent && { _id: parent.substring(1).split(`/`).at(-1)! },
    status: status && useEnum(Status).valueOf(status),
    type: Classification.Rock.fullName,
  }
})
