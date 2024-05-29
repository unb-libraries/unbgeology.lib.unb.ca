import { Rank, Status } from "~/types/classification"

export default defineMongooseReader(Classification.Fossil, async (payload, options) => {
  if (options.op === `create` && payload.type !== `classification/fossil`) { return {} }

  const create = options.op === `create`
  const { parent, rank, status } = await validateBody(payload, {
    // FIX: Work around as URIEntityTypeValidator cannot authorize against the API
    parent: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    rank: requireIf(create, EnumValidator(Rank)),
    status: optional(EnumValidator(Status)),
  })

  return {
    parent: parent && { _id: parent.substring(1).split(`/`).at(-1)! },
    rank: rank && useEnum(Rank).valueOf(rank),
    status: status && useEnum(Status).valueOf(status),
    type: Classification.Fossil.fullName,
  }
})
