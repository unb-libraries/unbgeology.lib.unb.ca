import { Enum, ObjectID } from "~/layers/mongo/server/utils/api/filter"
import { Rank, Status } from "~/types/classification"
import String from "~/layers/mongo/server/utils/api/filter/string"

export default defineMongooseEventQueryHandler(Classification.Fossil, defineEventQuery({
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
  rank: {
    default: false,
    filter: Enum(Rank),
  },
  status: {
    default: false,
    filter: Enum(Status),
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`classification/fossil`)) || value === `classification/fossil`) {
        return String(field, [op, Classification.Fossil.fullName])(query)
      }
    },
  },
}))
