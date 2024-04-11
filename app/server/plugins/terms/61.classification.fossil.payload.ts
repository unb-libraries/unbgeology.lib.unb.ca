import { Rank, Status } from "~/types/classification"

export default defineMongooseReader(Classification.Fossil, async (payload, options) => {
  if (options.op === `create` && payload.type !== `classification/fossil`) { return {} }

  const create = options.op === `create`
  const { rank, status } = await validateBody(payload, {
    rank: requireIf(create, EnumValidator(Rank)),
    status: optional(EnumValidator(Status)),
  })

  return {
    rank: rank && useEnum(Rank).valueOf(rank),
    status: status && useEnum(Status).valueOf(status),
    type: Classification.Fossil.fullName,
  }
})
