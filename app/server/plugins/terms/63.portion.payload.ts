import { Status } from "~/types/portion"

export default defineMongooseReader(FossilPortion, async (payload, options) => {
  if (options.op === `create` && payload.type !== `portion`) { return {} }

  const { status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
  })

  return {
    status: status && useEnum(Status).valueOf(status),
    type: FossilPortion.fullName,
  }
})
