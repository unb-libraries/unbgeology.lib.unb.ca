export default defineMongooseReader(StorageLocation, async (payload, options) => {
  if (options.op === `update` || payload.type !== `storageLocation`) { return {} }

  const { public: $public } = await validateBody(payload, {
    public: optional(BooleanValidator),
  })

  return {
    public: $public,
    type: StorageLocation.fullName,
  }
})
