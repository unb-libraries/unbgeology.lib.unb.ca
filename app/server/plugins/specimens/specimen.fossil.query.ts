import {
  ObjectIDFilter as ObjectID,
  StringFilter as String,
} from "~/server/utils/api/filter"

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
