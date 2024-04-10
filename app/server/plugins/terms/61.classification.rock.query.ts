import String from "~/layers/mongo/server/utils/api/filter/string"

export default defineMongooseEventQueryHandler(Classification.Rock, defineEventQuery({
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`classification/rock`)) || value === `classification/rock`) {
        return String(field, [op, Classification.Rock.fullName])(query)
      }
    },
  },
}))
