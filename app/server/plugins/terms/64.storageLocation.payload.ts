import { Status } from "~/types/storagelocation"

export default defineMongooseReader(StorageLocation, async (payload, options) => {
  if (options.op === `create` && payload.type !== `storageLocation`) { return {} }

  const { parent, public: $public, status } = await validateBody(payload, {
    // FIX: Work around as URIEntityTypeValidator cannot authorize against the API
    parent: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    public: optional(BooleanValidator),
    status: optional(EnumValidator(Status)),
  })

  return {
    parent: parent && { _id: parent.substring(1).split(`/`).at(-1)! },
    public: $public,
    status: status && useEnum(Status).valueOf(status),
    type: StorageLocation.fullName,
  }
})
