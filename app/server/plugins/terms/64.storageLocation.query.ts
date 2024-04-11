import { String, Boolean, Enum } from "~/layers/mongo/server/utils/api/filter"
import { Status } from "~/types/storagelocation"

export default defineMongooseEventQueryHandler(StorageLocation, defineEventQuery({
  public: {
    default: false,
    filter: Boolean,
  },
  status: {
    default: false,
    filter: Enum(Status),
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
