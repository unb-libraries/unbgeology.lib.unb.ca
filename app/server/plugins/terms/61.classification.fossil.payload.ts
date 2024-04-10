import { Rank } from "~/types/classification"

export default defineMongooseReader(Classification.Fossil, async (payload, { op }) => {
  if (op === `create` && payload.type !== `classification/fossil`) { return {} }

  const create = op === `create`
  const { rank } = await validateBody(payload, {
    rank: requireIf(create, EnumValidator(Rank)),
  })

  return {
    rank: rank && useEnum(Rank).valueOf(rank),
    type: Classification.Fossil.fullName,
  }
})
