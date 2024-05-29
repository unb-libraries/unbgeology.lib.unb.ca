import { Status } from "~/types/storagelocation"

export default defineMongooseFormatter(StorageLocation, async (doc) => {
  if (doc.__type !== StorageLocation.fullName) { return }

  const { public: $public, parent, status, type } = doc
  return {
    public: ($public !== undefined && $public) || undefined,
    parent: (parent && Object.values(parent).length > 0 && await renderDocument(parent, { model: Term, self: term => `/api/terms/${term._id}` })) || undefined,
    status: status && useEnum(Status).valueOf(status),
    type: type && `storageLocation`,
  }
})
