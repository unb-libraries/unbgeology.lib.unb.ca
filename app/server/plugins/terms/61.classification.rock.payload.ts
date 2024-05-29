import { Status } from "~/types/classification"

export default defineMongooseReader(Classification.Rock, async (payload, options) => {
  if (options.op === `create` && payload.type !== `classification/rock`) { return {} }

  const { parent, status } = await validateBody(payload, {
    // FIX: Work around as URIEntityTypeValidator cannot authorize against the API
    parent: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    status: optional(EnumValidator(Status)),
  })

  return {
    parent: parent && { _id: parent.substring(1).split(`/`).at(-1)! },
    status: status && useEnum(Status).valueOf(status),
    type: Classification.Rock.fullName,
  }
})
