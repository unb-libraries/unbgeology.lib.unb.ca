import { String, Enum } from "~/layers/mongo/server/utils/api/filter"
import { Status } from "~/types/composition"

export default defineMongooseEventQueryHandler(Composition.Rock, defineEventQuery({
  status: {
    default: false,
    filter: Enum(Status),
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`composition/rock`)) || value === `composition/rock`) {
        return String(field, [op, Composition.Rock.fullName])(query)
      }
    },
  },
}))
