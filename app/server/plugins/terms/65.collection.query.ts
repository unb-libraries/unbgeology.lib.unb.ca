import { String, Enum } from "~/layers/mongo/server/utils/api/filter"
import { Status } from "~/types/collection"

export default defineMongooseEventQueryHandler(Collection, defineEventQuery({
  status: {
    default: false,
    filter: Enum(Status),
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`collection`)) || value === `collection`) {
        return String(field, [op, Collection.fullName])(query)
      }
    },
  },
}))
