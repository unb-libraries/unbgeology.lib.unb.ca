import { Status } from "~/types/classification"

export default defineMongooseReader(Classification.Mineral, async (payload, options) => {
  if (options.op === `create` && payload.type !== `classification/mineral`) { return {} }

  const { composition, status } = await validateBody(payload, {
    composition: optional(StringValidator),
    status: optional(EnumValidator(Status)),
  })

  return {
    composition,
    status: status && useEnum(Status).valueOf(status),
    type: Classification.Mineral.fullName,
  }
})
