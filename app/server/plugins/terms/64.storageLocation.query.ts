import { String, Boolean } from "~/layers/mongo/server/utils/api/filter"

export default defineMongooseEventQueryHandler(StorageLocation, defineEventQuery({
  public: {
    default: false,
    filter: Boolean,
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`storageLocation`)) || value === `storageLocation`) {
        return String(field, [op, StorageLocation.fullName])(query)
      }
    },
  },
}))
