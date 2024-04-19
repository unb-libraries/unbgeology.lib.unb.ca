import { ObjectID, String } from "~/layers/mongo/server/utils/api/filter"

export default defineMongooseEventQueryHandler(Specimen.Fossil, defineEventQuery({
  portion: {
    default: true,
    join: Term,
    filter: ObjectID,
    definition: {
      label: {
        default: true,
        filter: String,
      },
    },
  },
}))
