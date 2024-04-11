export default defineMongooseFormatter(StorageLocation, (doc) => {
  const { type, public: $public } = doc
  return {
    public: $public !== undefined && $public,
    type: type && `storageLocation`,
  }
})
