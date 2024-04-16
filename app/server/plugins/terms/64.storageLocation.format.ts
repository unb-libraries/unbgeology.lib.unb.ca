import { Status } from "~/types/storagelocation"

export default defineMongooseFormatter(StorageLocation, (doc) => {
  if (doc.__type !== StorageLocation.fullName) { return }

  const { public: $public, status, type } = doc
  return {
    public: $public !== undefined && $public,
    status: status && useEnum(Status).valueOf(status),
    type: type && `storageLocation`,
  }
})
