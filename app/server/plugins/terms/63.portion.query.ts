import String from "~/layers/mongo/server/utils/api/filter/string"

export default defineMongooseEventQueryHandler(FossilPortion, defineEventQuery({
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`portion`)) || value === `portion`) {
        return String(field, [op, FossilPortion.fullName])(query)
      }
    },
  },
}))
