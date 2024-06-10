import { String, Enum } from "~/layers/mongo/server/utils/api/filter"
import { Status } from "~/types/composition"

export default defineMongooseEventQueryHandler(Composition.Fossil, defineEventQuery({
  status: {
    default: false,
    filter: Enum(Status),
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`composition/fossil`)) || value === `composition/fossil`) {
        return String(field, [op, Composition.Fossil.fullName])(query)
      }
    },
  },
}))
