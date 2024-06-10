import { Status } from "~/types/composition"

export default defineMongooseReader(Composition.Rock, async (payload, options) => {
  if (options.op === `create` && payload.type !== `composition/rock`) { return {} }

  const { status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
  })

  return {
    status: status && useEnum(Status).valueOf(status),
    type: Composition.Rock.fullName,
  }
})
