import { Status } from "~/types/collection"

export default defineMongooseReader(Collection, async (payload, options) => {
  if (options.op === `create` && payload.type !== `collection`) { return {} }

  const { status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
  })

  return {
    status: status && useEnum(Status).valueOf(status),
    type: Collection.fullName,
  }
})
