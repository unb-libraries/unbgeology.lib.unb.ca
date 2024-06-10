import { Status } from "~/types/composition"

export default defineMongooseReader(Composition.Fossil, async (payload, options) => {
  if (options.op === `create` && payload.type !== `composition/fossil`) { return {} }

  const { status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
  })

  return {
    status: status && useEnum(Status).valueOf(status),
    type: Composition.Fossil.fullName,
  }
})
