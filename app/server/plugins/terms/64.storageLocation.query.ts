import { String, Boolean, Enum, ObjectID } from "~/layers/mongo/server/utils/api/filter"
import { Status } from "~/types/storagelocation"

export default defineMongooseEventQueryHandler(StorageLocation, defineEventQuery({
  parent: {
    default: true,
    sort: `__l`,
    filter: false,
    definition: {
      id: {
        default: true,
        sort: false,
        filter: ObjectID,
      },
      label: {
        default: true,
        filter: String,
      },
    },
  },
  ancestors: {
    default: true,
    join: {
      documentType: Term,
      cardinality: `many`,
    },
    sort: false,
    filter: false,
    definition: {
      id: {
        default: true,
        sort: false,
        filter: false,
      },
      label: {
        default: true,
        filter: false,
      },
    },
  },
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
