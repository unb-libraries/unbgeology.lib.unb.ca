import EnumFilter from "~/layers/mongo/server/utils/api/filter/enum"
import { Rank } from "~/types/classification"
import String from "~/layers/mongo/server/utils/api/filter/string"

export default defineMongooseEventQueryHandler(Classification.Fossil, defineEventQuery({
  rank: {
    default: false,
    filter: EnumFilter(Rank),
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
