import { Status } from "~/types/classification"

export default defineMongooseReader(Classification.Rock, async (payload, options) => {
  if (options.op === `create` && payload.type !== `classification/rock`) { return {} }

  const { status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
  })

  return {
    status: status && useEnum(Status).valueOf(status),
    type: Classification.Rock.fullName,
  }
})
