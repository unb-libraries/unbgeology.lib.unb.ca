import { String, Enum } from "~/layers/mongo/server/utils/api/filter"
import { Status } from "~/types/portion"

export default defineMongooseEventQueryHandler(FossilPortion, defineEventQuery({
  status: {
    default: false,
    filter: Enum(Status),
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`portion`)) || value === `portion`) {
        return String(field, [op, FossilPortion.fullName])(query)
      }
    },
  },
}))
