import { Status } from "~/types/storagelocation"

export default defineMongooseReader(StorageLocation, async (payload, options) => {
  if (options.op === `create` && payload.type !== `storageLocation`) { return {} }

  const { public: $public, status } = await validateBody(payload, {
    public: optional(BooleanValidator),
    status: optional(EnumValidator(Status)),
  })

  return {
    public: $public,
    status: status && useEnum(Status).valueOf(status),
    type: StorageLocation.fullName,
  }
})
