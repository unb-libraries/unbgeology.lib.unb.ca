import { String, Enum, ObjectID } from "~/layers/mongo/server/utils/api/filter"
import { Status } from "~/types/classification"

export default defineMongooseEventQueryHandler(Classification.Mineral, defineEventQuery({
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
  composition: {
    default: false,
    filter: String,
  },
  status: {
    default: false,
    filter: Enum(Status),
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`classification/mineral`)) || value === `classification/mineral`) {
        return String(field, [op, Classification.Mineral.fullName])(query)
      }
    },
  },
}))
