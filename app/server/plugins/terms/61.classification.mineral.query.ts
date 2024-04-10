import { String } from "~/layers/mongo/server/utils/api/filter"

export default defineMongooseEventQueryHandler(Classification.Mineral, defineEventQuery({
  composition: {
    default: false,
    filter: String,
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
