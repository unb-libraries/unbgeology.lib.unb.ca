import { Status } from "~/types/classification"

export default defineMongooseReader(Classification.Mineral, async (payload, options) => {
  if (options.op === `create` && payload.type !== `classification/mineral`) { return {} }

  const { parent, composition, status } = await validateBody(payload, {
    // FIX: Work around as URIEntityTypeValidator cannot authorize against the API
    parent: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    composition: optional(StringValidator),
    status: optional(EnumValidator(Status)),
  })

  return {
    parent: parent && { _id: parent.substring(1).split(`/`).at(-1)! },
    composition,
    status: status && useEnum(Status).valueOf(status),
    type: Classification.Mineral.fullName,
  }
})
