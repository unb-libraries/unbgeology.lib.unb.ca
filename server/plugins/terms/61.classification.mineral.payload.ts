import { Status } from "~~/types/classification"

export default defineMongooseReader(Classification.Mineral, async (payload, options) => {
  if (options.op === `create` && payload.type !== `classification/mineral`) { return {} }

  const { description, image, parent, composition, status } = await validateBody(payload, {
    description: optional(StringValidator),
    image: optional(MatchValidator(/^\/api\/files\/[a-z0-9]{24}$/)),
    // FIX: Work around as URIEntityTypeValidator cannot authorize against the API
    parent: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    composition: optional(StringValidator),
    status: optional(EnumValidator(Status)),
  })

  return {
    description,
    image: image && { _id: image.substring(1).split(`/`).at(-1)! },
    parent: parent && { _id: parent.substring(1).split(`/`).at(-1)! },
    composition,
    status: status && useEnum(Status).valueOf(status),
    type: Classification.Mineral.fullName,
  }
})
