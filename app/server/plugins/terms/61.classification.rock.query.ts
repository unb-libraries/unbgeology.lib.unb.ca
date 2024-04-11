import { Enum } from "~/layers/mongo/server/utils/api/filter"
import String from "~/layers/mongo/server/utils/api/filter/string"
import { Status } from "~/types/classification"

export default defineMongooseEventQueryHandler(Classification.Rock, defineEventQuery({
  status: {
    default: false,
    filter: Enum(Status),
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`classification/rock`)) || value === `classification/rock`) {
        return String(field, [op, Classification.Rock.fullName])(query)
      }
    },
  },
}))
